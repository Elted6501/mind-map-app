import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Upload, FileText, AlertCircle, CheckCircle, X, HelpCircle } from 'lucide-react';
import { importService, ImportResult } from '@/services/ImportService';

interface ImportComponentProps {
  onImportSuccess: (mindMapId: string) => void;
  onClose: () => void;
}

const ImportComponent: React.FC<ImportComponentProps> = ({ onImportSuccess, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['JSON (.json)', 'CSV (.csv)'];
  const supportedExtensions = ['.json', '.csv'];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!supportedExtensions.includes(fileExtension)) {
      setImportResult({
        success: false,
        errors: [{ 
          field: 'file', 
          message: `Unsupported file format. Supported formats: ${supportedFormats.join(', ')}` 
        }]
      });
      return;
    }

    setSelectedFile(file);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      let result: ImportResult;
      
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      console.log('File name:', selectedFile.name, 'Extension:', fileExtension);
      
      if (fileExtension === 'json') {
        result = await importService.importFromJSON(selectedFile);
      } else if (fileExtension === 'csv') {
        result = await importService.importFromCSV(selectedFile);
      } else {
        result = {
          success: false,
          errors: [{ field: 'file', message: `Unsupported file format "${fileExtension}". Supported formats: JSON (.json), CSV (.csv)` }]
        };
      }

      setImportResult(result);

      if (result.success && result.mindMapId) {
        // Auto-close after successful import
        setTimeout(() => {
          onImportSuccess(result.mindMapId!);
        }, 2000);
      }

    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: false,
        errors: [{ field: 'general', message: 'Import failed: ' + (error as Error).message }]
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return createPortal(
    <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 100000 }}>
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Import Mind Map
              </h2>
              <a
                href="/import-guide"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 text-blue-600 hover:text-blue-800 transition-colors"
                title="View Import Guide"
              >
                <HelpCircle className="w-5 h-5" />
              </a>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Import Result */}
          {importResult && (
            <div className={`mb-6 p-4 rounded-lg ${
              importResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start">
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                )}
                
                <div className="flex-1">
                  {importResult.success ? (
                    <div>
                      <h3 className="font-medium text-green-800 mb-1">
                        Import Successful!
                      </h3>
                      {importResult.imported && (
                        <p className="text-sm text-green-700">
                          Imported {importResult.imported.nodes} nodes and {importResult.imported.connections} connections
                        </p>
                      )}
                      <p className="text-sm text-green-600 mt-1">
                        Redirecting to your new mind map...
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium text-red-800 mb-2">
                        Import Failed
                      </h3>
                      {importResult.errors?.map((error, index) => (
                        <div key={index} className="text-sm text-red-700 mb-1">
                          <strong>{error.field}:</strong> {error.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload a file to import
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose File
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={supportedFormats.join(',')}
                onChange={handleFileInputChange}
              />
              
              {/* Supported Formats */}
              <div className="mt-6 text-sm text-gray-500">
                <p className="font-medium mb-2">Supported formats:</p>
                <div className="space-y-1">
                  {supportedFormats.map(format => (
                    <div key={format} className="flex justify-between">
                      <span className="font-mono">{format}</span>
                      <span>{format.includes('JSON') ? 'Mind map data' : 'Tabular data'}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    <strong>Need help?</strong> Check our{' '}
                    <a 
                      href="/import-guide" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Import Guide
                    </a>{' '}
                    for file structure examples and tips.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File */}
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{selectedFile.name}</h3>
                  <p className="text-sm text-gray-600">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Import Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isImporting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Importing...
                    </div>
                  ) : (
                    'Import Mind Map'
                  )}
                </button>
                
                <button
                  onClick={handleReset}
                  disabled={isImporting}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImportComponent;