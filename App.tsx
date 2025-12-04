import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { InventoryItem } from './types';
import { parseCSV } from './utils/csvHelpers';

const App: React.FC = () => {
  const [inventoryData, setInventoryData] = useState<InventoryItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await parseCSV(file);
      setInventoryData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to parse the CSV file. Please check the format and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInventoryData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {inventoryData ? (
        <Dashboard data={inventoryData} onReset={handleReset} />
      ) : (
        <div className="flex flex-col h-screen">
          <header className="bg-white shadow-sm py-4 px-6 border-b border-slate-200">
             <h1 className="text-xl font-bold text-indigo-700">Inventory Ops Analyzer</h1>
          </header>
          <main className="flex-grow flex items-center justify-center">
            <div className="w-full max-w-4xl">
              {error && (
                <div className="mx-6 mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
                  <p className="font-bold">Error</p>
                  <p>{error}</p>
                </div>
              )}
              <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
