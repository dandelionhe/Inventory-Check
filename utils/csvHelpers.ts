import { InventoryItem, InventoryStats, StockStatus, Alert } from '../types';
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

export const parseCSV = (file: File): Promise<{ items: InventoryItem[], date: string }> => {
  return new Promise((resolve, reject) => {
    // First, read the first line to check for a date
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const firstLine = lines[0].trim();
      
      let date = new Date().toISOString().split('T')[0]; // Default to today
      let csvContent = text;

      // Check if first line looks like a date (e.g. 2023-10-27 or 10/27/2023)
      // And check if it does NOT contain commas (which would imply it's a header row)
      const potentialDate = new Date(firstLine);
      const isValidDate = !isNaN(potentialDate.getTime());
      const hasCommas = firstLine.includes(',');

      // If it is a valid date and NOT a standard CSV header row
      if (isValidDate && !hasCommas && firstLine.length < 50) {
         date = potentialDate.toISOString().split('T')[0];
         // Remove the first line so PapaParse handles the headers correctly on the second line
         csvContent = lines.slice(1).join('\n');
      }

      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
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

          // Filter out rows with "Unknown" SKU if any empty rows slipped through
          const validItems = processed.filter(i => i.sku !== 'Unknown');
          resolve({ items: validItems, date });
        },
        error: (error) => {
          reject(error);
        }
      });
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

export const calculateStats = (items: InventoryItem[]): InventoryStats => {
  return items.reduce((acc, item) => {
    acc.totalSkus++;
    
    // US Stats
    if (item.usStatus === 'Out of Stock') acc.usOutOfStock++;
    if (item.usStock > 0 && item.usStock < 10) acc.usLowStock++;
    if (item.usStock >= 10) acc.usInStock++;

    // Canada Stats
    if (item.canadaStatus === 'Out of Stock') acc.canadaOutOfStock++;
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

export const generateAlerts = (currentItems: InventoryItem[], previousItems: InventoryItem[], date: string): Alert[] => {
  const alerts: Alert[] = [];
  const prevMap = new Map(previousItems.map(i => [i.sku, i]));

  currentItems.forEach(curr => {
    const prev = prevMap.get(curr.sku);
    if (!prev) return; // New item, skip alert

    // --- US Logic ---
    // 1. Fell below 10 (was >= 10, now < 10 and > 0)
    if (prev.usStock >= 10 && curr.usStock < 10 && curr.usStock > 0) {
      alerts.push({
        id: `us-low-${curr.sku}-${date}`,
        sku: curr.sku,
        market: 'US',
        type: 'LOW_STOCK',
        message: 'Stock fell below 10 units',
        previousQty: prev.usStock,
        newQty: curr.usStock,
        date
      });
    }
    // 2. Went Out of Stock (was > 0, now 0)
    if (prev.usStock > 0 && curr.usStock === 0) {
      alerts.push({
        id: `us-oos-${curr.sku}-${date}`,
        sku: curr.sku,
        market: 'US',
        type: 'OUT_OF_STOCK',
        message: 'Item went Out of Stock',
        previousQty: prev.usStock,
        newQty: 0,
        date
      });
    }
    // 3. Back in Stock (was 0, now > 0)
    if (prev.usStock === 0 && curr.usStock > 0) {
      alerts.push({
        id: `us-restock-${curr.sku}-${date}`,
        sku: curr.sku,
        market: 'US',
        type: 'RESTOCK',
        message: 'Item is Back in Stock',
        previousQty: 0,
        newQty: curr.usStock,
        date
      });
    }

    // --- Canada Logic ---
    if (prev.canadaStock >= 10 && curr.canadaStock < 10 && curr.canadaStock > 0) {
      alerts.push({
        id: `ca-low-${curr.sku}-${date}`,
        sku: curr.sku,
        market: 'CA',
        type: 'LOW_STOCK',
        message: 'Stock fell below 10 units',
        previousQty: prev.canadaStock,
        newQty: curr.canadaStock,
        date
      });
    }
    if (prev.canadaStock > 0 && curr.canadaStock === 0) {
      alerts.push({
        id: `ca-oos-${curr.sku}-${date}`,
        sku: curr.sku,
        market: 'CA',
        type: 'OUT_OF_STOCK',
        message: 'Item went Out of Stock',
        previousQty: prev.canadaStock,
        newQty: 0,
        date
      });
    }
    if (prev.canadaStock === 0 && curr.canadaStock > 0) {
      alerts.push({
        id: `ca-restock-${curr.sku}-${date}`,
        sku: curr.sku,
        market: 'CA',
        type: 'RESTOCK',
        message: 'Item is Back in Stock',
        previousQty: 0,
        newQty: curr.canadaStock,
        date
      });
    }
  });

  return alerts;
};