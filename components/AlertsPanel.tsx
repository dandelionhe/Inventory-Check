import React, { useState } from 'react';
import { Alert, Market } from '../types';
import { AlertTriangle, AlertCircle, TrendingUp, Search } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const [activeMarket, setActiveMarket] = useState<Market>('US');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlerts = alerts.filter(alert => 
    alert.market === activeMarket && 
    alert.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch(type) {
      case 'LOW_STOCK': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'OUT_OF_STOCK': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'RESTOCK': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getColorClass = (type: string) => {
    switch(type) {
      case 'LOW_STOCK': return 'border-amber-200 bg-amber-50';
      case 'OUT_OF_STOCK': return 'border-red-200 bg-red-50';
      case 'RESTOCK': return 'border-emerald-200 bg-emerald-50';
      default: return 'border-slate-200 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveMarket('US')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeMarket === 'US' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            US Alerts
          </button>
          <button
            onClick={() => setActiveMarket('CA')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeMarket === 'CA' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            CA Alerts
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <div key={alert.id} className={`flex items-center p-4 rounded-lg border-l-4 shadow-sm bg-white ${getColorClass(alert.type)}`}>
              <div className="mr-4 p-2 bg-white rounded-full shadow-sm">
                {getIcon(alert.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-bold text-slate-800">{alert.sku}</h4>
                  <span className="text-xs text-slate-500">{alert.date}</span>
                </div>
                <p className="text-sm font-medium text-slate-700">{alert.message}</p>
                <div className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
                  <span>Prev: <span className="font-mono font-bold">{alert.previousQty}</span></span>
                  <span>→</span>
                  <span>New: <span className="font-mono font-bold">{alert.newQty}</span></span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">No alerts found for this market.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;