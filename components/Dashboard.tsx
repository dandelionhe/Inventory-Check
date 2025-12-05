import React, { useMemo, useState } from 'react';
import { InventoryItem, InventoryStats, Alert, Market } from '../types';
import { calculateStats } from '../utils/csvHelpers';
import StockTable, { FilterMode } from './StockTable';
import AlertsPanel from './AlertsPanel';
import HistoryView from './HistoryView';
import { Package, CheckCircle, AlertOctagon, AlertCircle, LayoutDashboard, Bell, LineChart } from 'lucide-react';

interface DashboardProps {
  data: InventoryItem[];
  alerts: Alert[];
  onReset: () => void;
  currentDate: string;
}

const Dashboard: React.FC<DashboardProps> = ({ data, alerts, onReset, currentDate }) => {
  const stats: InventoryStats = useMemo(() => calculateStats(data), [data]);
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'ALERTS' | 'HISTORY'>('INVENTORY');
  
  // Dashboard internal states for Inventory Tab
  const [activeMarket, setActiveMarket] = useState<Market>('US');
  const [activeFilter, setActiveFilter] = useState<FilterMode>('ALL');

  const marketStats = {
    totalItems: activeMarket === 'US' ? stats.totalSkus : stats.totalSkus,
    lowStock: activeMarket === 'US' ? stats.usLowStock : stats.canadaLowStock,
    outOfStock: activeMarket === 'US' ? stats.usOutOfStock : stats.canadaOutOfStock,
    inStock: activeMarket === 'US' ? stats.usInStock : stats.canadaInStock,
  };

  const handleFilterClick = (filter: FilterMode) => {
    if (activeFilter === filter) setActiveFilter('ALL');
    else setActiveFilter(filter);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-indigo-600" />
              <span className="ml-3 text-xl font-bold text-slate-800">Inventory Ops Analyzer</span>
              <span className="ml-4 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                Data: {currentDate}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
              >
                Upload New File
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Tab Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 -mb-px">
            <button
              onClick={() => setActiveTab('INVENTORY')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'INVENTORY' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Current Inventory
            </button>
            <button
              onClick={() => setActiveTab('ALERTS')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'ALERTS' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Bell className="w-4 h-4 mr-2" />
              Alert Area
              {alerts.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-bold animate-pulse">
                  {alerts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'HISTORY' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <LineChart className="w-4 h-4 mr-2" />
              History Analysis
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        
        {activeTab === 'INVENTORY' && (
          <div className="animate-fade-in">
            <div className="flex justify-center mb-8">
              <div className="bg-slate-200 p-1 rounded-lg inline-flex shadow-inner">
                <button
                  onClick={() => { setActiveMarket('US'); setActiveFilter('ALL'); }}
                  className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                    activeMarket === 'US' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  🇺🇸 United States
                </button>
                <button
                  onClick={() => { setActiveMarket('CA'); setActiveFilter('ALL'); }}
                  className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                    activeMarket === 'CA' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  🇨🇦 Canada
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
              <div 
                onClick={() => handleFilterClick('LOW_STOCK')}
                className={`cursor-pointer overflow-hidden shadow-lg rounded-xl border-l-4 transition-all transform hover:-translate-y-1 ${
                  activeFilter === 'LOW_STOCK' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300' : 'bg-white border-amber-500 hover:shadow-xl'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 truncate">Low Inventory Area</p>
                      <p className="mt-1 text-3xl font-semibold text-slate-900">{marketStats.lowStock}</p>
                    </div>
                    <div className={`p-3 rounded-full ${activeFilter === 'LOW_STOCK' ? 'bg-amber-200' : 'bg-amber-100'}`}>
                      <AlertOctagon className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                      Items with 1-9 units
                    </span>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => handleFilterClick('OOS')}
                className={`cursor-pointer overflow-hidden shadow-lg rounded-xl border-l-4 transition-all transform hover:-translate-y-1 ${
                  activeFilter === 'OOS' ? 'bg-red-50 border-red-500 ring-2 ring-red-300' : 'bg-white border-red-500 hover:shadow-xl'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 truncate">Out of Stock</p>
                      <p className="mt-1 text-3xl font-semibold text-slate-900">{marketStats.outOfStock}</p>
                    </div>
                    <div className={`p-3 rounded-full ${activeFilter === 'OOS' ? 'bg-red-200' : 'bg-red-100'}`}>
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                     <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                      Requires Attention
                    </span>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => handleFilterClick('ALL')}
                className={`cursor-pointer overflow-hidden shadow-lg rounded-xl border-l-4 transition-all transform hover:-translate-y-1 ${
                  activeFilter === 'ALL' ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300' : 'bg-white border-emerald-500 hover:shadow-xl'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 truncate">Healthy Inventory</p>
                      <p className="mt-1 text-3xl font-semibold text-slate-900">{marketStats.inStock}</p>
                    </div>
                    <div className={`p-3 rounded-full ${activeFilter === 'ALL' ? 'bg-emerald-200' : 'bg-emerald-100'}`}>
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                     <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                      &ge; 10 units available
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
              <StockTable items={data} activeFilter={activeFilter} market={activeMarket} />
            </div>
          </div>
        )}

        {activeTab === 'ALERTS' && (
          <div className="animate-fade-in">
             <AlertsPanel alerts={alerts} />
          </div>
        )}
        
        {activeTab === 'HISTORY' && (
          <div className="animate-fade-in">
            <HistoryView />
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;