import { InventorySnapshot, InventoryItem, HistoryPoint } from '../types';

const DB_NAME = 'InventoryOpsDB';
const STORE_NAME = 'snapshots';
const VERSION = 1;

export class InventoryDB {
  private db: IDBDatabase | null = null;

  async connect(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'date' });
        }
      };
    });
  }

  async saveSnapshot(date: string, items: InventoryItem[]): Promise<void> {
    await this.connect();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ date, items });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSnapshot(date: string): Promise<InventorySnapshot | undefined> {
    await this.connect();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(date);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSnapshots(): Promise<InventorySnapshot[]> {
    await this.connect();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort by date descending
        const results = request.result as InventorySnapshot[];
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getLatestSnapshotBefore(date: string): Promise<InventorySnapshot | undefined> {
    const all = await this.getAllSnapshots();
    // Assuming all are sorted descending, find the first one that is strictly before the given date.
    // Ideally we want the immediate previous record to compare against.
    // If the current date matches the most recent record, we skip it to find the *previous* one.
    return all.find(s => s.date < date);
  }
  
  // Get history for a specific SKU across all snapshots
  async getItemHistory(sku: string): Promise<HistoryPoint[]> {
    const snapshots = await this.getAllSnapshots();
    // Sort ascending for chart
    snapshots.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return snapshots.map(snap => {
      const item = snap.items.find(i => i.sku === sku);
      return {
        date: snap.date,
        usStock: item ? item.usStock : 0,
        canadaStock: item ? item.canadaStock : 0
      };
    });
  }
}

export const db = new InventoryDB();