export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
export type Market = 'US' | 'CA';

export interface InventoryItem {
  sku: string;
  usStock: number;
  canadaStock: number;
  usStatus: StockStatus;
  canadaStatus: StockStatus;
  usWarehouses: Record<string, number>;
  canadaWarehouses: Record<string, number>;
}

export interface InventoryStats {
  totalSkus: number;
  usOutOfStock: number;
  canadaOutOfStock: number;
  usLowStock: number;     // Items with < 10 units (includes 0)
  canadaLowStock: number; // Items with < 10 units (includes 0)
  usInStock: number;      // Items with >= 10 units
  canadaInStock: number;  // Items with >= 10 units
}

export type AlertType = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'RESTOCK';

export interface Alert {
  id: string;
  sku: string;
  market: Market;
  type: AlertType;
  message: string;
  previousQty: number;
  newQty: number;
  date: string;
}

export interface InventorySnapshot {
  date: string; // ISO Date string YYYY-MM-DD
  items: InventoryItem[];
}

export interface HistoryPoint {
  date: string;
  usStock: number;
  canadaStock: number;
}