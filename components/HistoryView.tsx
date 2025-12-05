import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db } from '../utils/db';
import { HistoryPoint } from '../types';
import { Search, Loader2, History } from 'lucide-react';

const HistoryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSku, setActiveSku] = useState<string | null>(null);
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [allSkus, setAllSkus] = useState<string[]>([]);

  // Load available SKUs on mount
  useEffect(() => {
    const loadSkus = async () => {
      // Get the latest snapshot to list SKUs
      const snapshots = await db.getAllSnapshots();
      if (snapshots.length > 0) {
        // Just take skus from the latest snapshot
        const latest = snapshots[0];
        setAllSkus(latest.items.map(i => i.sku).sort());
      }
    };
    loadSkus();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;
    
    // Simple match
    const foundSku = allSkus.find(s => s.toLowerCase() === searchTerm.toLowerCase()) 
                  || allSkus.find(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    if (foundSku) {
      await loadHistory(foundSku);
    }
  };

  const loadHistory = async (sku: string) => {
    setActiveSku(sku);
    setSearchTerm(sku);
    setLoading(true);
    try {
      const history = await db.getItemHistory(sku);
      setData(history);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Filter suggestions
  const suggestions = searchTerm && !activeSku 
    ? allSkus.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
      <div className="flex items-center mb-6">
        <History className="w-6 h-6 text-indigo-600 mr-2" />
        <h2 className="text-lg font-bold text-slate-800">Inventory History Analysis</h2>
      </div>
      
      <div className="max-w-xl mx-auto mb-8 relative">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Enter SKU to analyze..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setActiveSku(null); // Clear active chart when typing
            }}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-shadow"
          />
        </form>
        {suggestions.length > 0 && (
           <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg mt-2 shadow-xl overflow-hidden">
             {suggestions.map(sku => (
               <div 
                 key={sku} 
                 className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700 border-b border-slate-100 last:border-0"
                 onClick={() => loadHistory(sku)}
               >
                 {sku}
               </div>
             ))}
           </div>
        )}
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
          <p>Loading history...</p>
        </div>
      ) : activeSku ? (
        <div className="h-96 w-full animate-fade-in">
           <h3 className="text-center text-xl font-bold text-indigo-900 mb-6">{activeSku} Stock Trend</h3>
           <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                tick={{fontSize: 12}}
                tickMargin={10}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{fontSize: 12}}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '12px', 
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line 
                type="monotone" 
                dataKey="usStock" 
                name="US Stock" 
                stroke="#4f46e5" 
                activeDot={{ r: 6 }} 
                strokeWidth={3} 
                dot={{r: 4, strokeWidth: 0, fill: '#4f46e5'}}
              />
              <Line 
                type="monotone" 
                dataKey="canadaStock" 
                name="Canada Stock" 
                stroke="#ef4444" 
                strokeWidth={3} 
                dot={{r: 4, strokeWidth: 0, fill: '#ef4444'}}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
          <History className="w-12 h-12 text-slate-300 mb-2" />
          <p>Search for a SKU to visualize its inventory history</p>
        </div>
      )}
    </div>
  );
};

export default HistoryView;