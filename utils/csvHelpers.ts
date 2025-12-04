import { InventoryItem, InventoryStats, StockStatus } from '../types';
import Papa from 'papaparse';

// Hardcoded rules from the prompt
const CA_WAREHOUSE = "Prescott, ON";
const IGNORED_COLUMNS = ["Returns"];
const ID_COLUMN = "SKU";
const LOW_STOCK_THRESHOLD = 10;

const getStatus = (qty: number): StockStatus => {
  if (qty === 0) return 'Out of Stock';
  if (qty < LOW_STOCK_THRESHOLD) return 'Low Stock';
  return 'In Stock';
};

export const parseCSV = (file: File): Promise<InventoryItem[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // Converts numbers automatically
      complete: (results) => {
        const data = results.data as Record<string, any>[];
        
        const processed: InventoryItem[] = data.map((row) => {
          const sku = row[ID_COLUMN] ? String(row[ID_COLUMN]) : 'Unknown';
          let usStock = 0;
          let canadaStock = 0;
          const usWarehouses: Record<string, number> = {};
          const canadaWarehouses: Record<string, number> = {};

          Object.keys(row).forEach((key) => {
            if (key === ID_COLUMN) return;
            
            // Ensure value is a number
            const val = typeof row[key] === 'number' ? row[key] : 0;
            
            if (key === CA_WAREHOUSE) {
              canadaStock += val;
              canadaWarehouses[key] = val;
            } else if (!IGNORED_COLUMNS.includes(key)) {
              usStock += val;
              // Only add to warehouse breakdown if > 0 to keep UI clean, 
              // or add all if we want to show 0s. Let's show > 0 for cleanliness
              if (val > 0) {
                usWarehouses[key] = val;
              }
            }
          });

          return {
            sku,
            usStock,
            canadaStock,
            usStatus: getStatus(usStock),
            canadaStatus: getStatus(canadaStock),
            usWarehouses,
            canadaWarehouses
          };
        });

        resolve(processed);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const calculateStats = (items: InventoryItem[]): InventoryStats => {
  return items.reduce((acc, item) => {
    acc.totalSkus++;
    
    // US Stats
    if (item.usStatus === 'Out of Stock') acc.usOutOfStock++;
    
    // Low Stock logic: Strictly 1 to 9. 0 is Out of Stock.
    if (item.usStock > 0 && item.usStock < 10) acc.usLowStock++;
    if (item.usStock >= 10) acc.usInStock++;

    // Canada Stats
    if (item.canadaStatus === 'Out of Stock') acc.canadaOutOfStock++;
    
    // Low Stock logic: Strictly 1 to 9. 0 is Out of Stock.
    if (item.canadaStock > 0 && item.canadaStock < 10) acc.canadaLowStock++;
    if (item.canadaStock >= 10) acc.canadaInStock++;
    
    return acc;
  }, {
    totalSkus: 0,
    usOutOfStock: 0,
    canadaOutOfStock: 0,
    usLowStock: 0,
    canadaLowStock: 0,
    usInStock: 0,
    canadaInStock: 0
  } as InventoryStats);
};