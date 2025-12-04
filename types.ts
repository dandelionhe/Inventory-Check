export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

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