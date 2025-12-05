import React, { useState, useEffect } from 'react';
import { InventoryItem, Market } from '../types';
import { Search, AlertCircle, CheckCircle2, PackageX, AlertTriangle, ChevronDown, ChevronRight, Warehouse, MapPin } from 'lucide-react';

export type FilterMode = 'ALL' | 'OOS' | 'LOW_STOCK';

interface StockTableProps {
  items: InventoryItem[];
  activeFilter: FilterMode;
  market: Market;
}

const StockTable: React.FC<StockTableProps> = ({ items, activeFilter, market }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Clear expanded rows when filter or market changes
  useEffect(() => {
    setExpandedRows(new Set());
  }, [activeFilter, market]);

  const toggleRow = (sku: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(sku)) {
      newExpanded.delete(sku);
    } else {
      newExpanded.add(sku);
    }
    setExpandedRows(newExpanded);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    const stock = market === 'US' ? item.usStock : item.canadaStock;

    if (activeFilter === 'OOS') return stock === 0;
    // Strict "1-9" interpretation for Low Stock filter (exclude 0)
    if (activeFilter === 'LOW_STOCK') return stock > 0 && stock < 10;
    
    return true;
  });

  const getStatusBadge = (qty: number) => {
    if (qty === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Out of Stock
        </span>
      );
    }
    if (qty < 10) {
      return (
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Low Stock
          </span>
          <span className="text-xs text-slate-500 font-mono font-bold">{qty} units</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          In Stock
        </span>
        <span className="text-xs text-slate-500 font-mono">{qty} units</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
        <div className="flex items-center">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {market === 'US' ? 'United States Inventory' : 'Canada Inventory'}
            </h3>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                {filteredItems.length}
            </span>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            placeholder={`Search SKU in ${market}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">
                {/* Expand Toggle */}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                SKU
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Qty
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const stock = market === 'US' ? item.usStock : item.canadaStock;
                const warehouses = market === 'US' ? item.usWarehouses : item.canadaWarehouses;
                const isExpanded = expandedRows.has(item.sku);

                return (
                  <React.Fragment key={item.sku}>
                    <tr 
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${isExpanded ? 'bg-indigo-50/60' : ''}`}
                      onClick={() => toggleRow(item.sku)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(stock)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-medium text-slate-700">
                        {stock}
                      </td>
                    </tr>
                    
                    {/* Expanded Detail Row */}
                    {isExpanded && (
                      <tr className="bg-indigo-50/40">
                        <td colSpan={4} className="px-6 py-4">
                          <div className="text-sm pl-8">
                            <h4 className="font-semibold text-indigo-900 mb-3 flex items-center text-xs uppercase tracking-wide">
                              <Warehouse className="w-3 h-3 mr-2" />
                              {market === 'US' ? 'US Warehouses' : 'Canada Warehouses'}
                            </h4>
                            {Object.keys(warehouses).length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {Object.entries(warehouses).map(([warehouse, qty]) => (
                                  <div key={warehouse} className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm flex flex-col">
                                    <div className="flex items-center mb-1">
                                      <MapPin className="w-3 h-3 text-indigo-400 mr-1" />
                                      <span className="text-xs text-slate-500 uppercase tracking-wide truncate w-full" title={warehouse}>
                                        {warehouse}
                                      </span>
                                    </div>
                                    <div className={`text-xl font-mono font-semibold ${(qty as number) < 5 ? 'text-red-600' : 'text-slate-800'}`}>
                                      {qty}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-slate-500 italic text-sm">
                                No inventory in any {market} warehouse.
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <PackageX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p>No items found matching your filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockTable;