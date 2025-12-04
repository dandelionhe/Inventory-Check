import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileUpload(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div 
        className="w-full max-w-xl p-12 bg-white rounded-2xl shadow-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 transition-colors cursor-pointer text-center group"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-indigo-50 rounded-full group-hover:bg-indigo-100 transition-colors">
            <Upload className="w-10 h-10 text-indigo-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Inventory Feed</h2>
        <p className="text-slate-500 mb-8">
          Drag and drop your CSV file here, or click to select a file.
        </p>

        <label className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium text-sm rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all transform hover:scale-105">
          <FileSpreadsheet className="w-5 h-5 mr-2" />
          <span>{isLoading ? 'Processing...' : 'Select CSV File'}</span>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            onChange={handleFileChange} 
            disabled={isLoading}
          />
        </label>
        
        <div className="mt-8 text-xs text-slate-400 text-left bg-slate-50 p-4 rounded-lg">
          <p className="font-semibold mb-1">Expected Format Logic:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Canada:</strong> "Prescott, ON" column only.</li>
            <li><strong>US:</strong> All other warehouses (San Francisco, FBA, etc).</li>
            <li><strong>Excluded:</strong> "Returns" column is ignored.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
