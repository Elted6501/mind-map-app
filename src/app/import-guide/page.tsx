"use client";

import React from 'react';
import { FileText, Download, Upload, CheckCircle } from 'lucide-react';

export default function ImportGuidePage() {

  const downloadSampleJSON = () => {
    const sampleData = {
      title: "Sample Mind Map",
      nodes: [
        {
          id: "root",
          text: "Main Topic",
          x: 400,
          y: 300,
          width: 120,
          height: 60,
          color: "#3b82f6",
          shape: "rectangle"
        },
        {
          id: "child1",
          text: "Subtopic 1",
          x: 200,
          y: 200,
          width: 100,
          height: 50,
          color: "#10b981",
          shape: "circle"
        },
        {
          id: "child2",
          text: "Subtopic 2",
          x: 600,
          y: 200,
          width: 100,
          height: 50,
          color: "#f59e0b",
          shape: "rectangle"
        }
      ],
      connections: [
        {
          id: "conn1",
          fromNodeId: "root",
          toNodeId: "child1",
          type: "straight",
          color: "#6b7280"
        },
        {
          id: "conn2",
          fromNodeId: "root",
          toNodeId: "child2",
          type: "straight",
          color: "#6b7280"
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSampleCSV = () => {
    const csvContent = `Node ID,Text,X,Y,Width,Height,Color,Shape,Parent ID
root,Main Topic,400,300,120,60,#3b82f6,rectangle,
child1,Subtopic 1,200,200,100,50,#10b981,circle,root
child2,Subtopic 2,600,200,100,50,#f59e0b,rectangle,root
child3,Detail A,100,100,80,40,#ef4444,circle,child1
child4,Detail B,300,100,80,40,#8b5cf6,rectangle,child1`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-mindmap.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-8">{/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mb-3 sm:mb-4" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Import Guide
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Learn how to import your mind maps from JSON and CSV files
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8" id="quick-start">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 flex items-center flex-wrap">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2 flex-shrink-0" />
            Quick Start
          </h2>
          <div className="space-y-3 text-gray-700 text-sm sm:text-base">
            <p><strong>1.</strong> Prepare your data in JSON or CSV format following the structures below</p>
            <p><strong>2.</strong> Go to your mind maps dashboard and click the &ldquo;Import&rdquo; button</p>
            <p><strong>3.</strong> Drag and drop your file or click to browse</p>
            <p><strong>4.</strong> Your mind map will be created automatically with nodes and connections</p>
          </div>
        </div>

        {/* Supported Formats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8" id="formats">
          {/* JSON Format */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 flex-shrink-0" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">JSON Format</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Complete mind map structure with full control over positioning and styling.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 overflow-hidden">
              <pre className="text-xs sm:text-sm overflow-x-auto whitespace-pre-wrap break-words">{`{
  "title": "My Mind Map",
  "nodes": [
    {
      "id": "root",
      "text": "Main Topic",
      "x": 400,
      "y": 300,
      "width": 120,
      "height": 60,
      "color": "#3b82f6",
      "shape": "rectangle"
    }
  ],
  "connections": [
    {
      "id": "conn1",
      "fromNodeId": "root",
      "toNodeId": "child1",
      "type": "straight",
      "color": "#6b7280"
    }
  ]
}`}</pre>
            </div>
            <button
              onClick={downloadSampleJSON}
              className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm sm:text-base"
            >
              <Download className="w-4 h-4 mr-2 flex-shrink-0" />
              Download JSON Sample
            </button>
          </div>

          {/* CSV Format */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2 flex-shrink-0" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">CSV Format</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Simple tabular format with automatic connection creation from parent-child relationships.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 overflow-hidden">
              <pre className="text-xs sm:text-sm overflow-x-auto whitespace-pre-wrap break-words">{`Node ID,Text,X,Y,Width,Height,Color,Shape,Parent ID
root,Main Topic,400,300,120,60,#3b82f6,rectangle,
child1,Subtopic 1,200,200,100,50,#10b981,circle,root
child2,Subtopic 2,600,200,100,50,#f59e0b,rectangle,root`}</pre>
            </div>
            <button
              onClick={downloadSampleCSV}
              className="w-full bg-green-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm sm:text-base"
            >
              <Download className="w-4 h-4 mr-2 flex-shrink-0" />
              Download CSV Sample
            </button>
          </div>
        </div>

        {/* Field Reference */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8" id="field-reference">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Field Reference</h2>
          
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium">Field</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium">Type</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium">Required</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 font-mono text-xs sm:text-sm">Node ID</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">String</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">✅</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">Unique identifier for the node</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 font-mono text-xs sm:text-sm">Text</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">String</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">✅</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">Display text for the node</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 font-mono text-xs sm:text-sm">X, Y</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">Number</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">✅</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">Position coordinates on canvas</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 font-mono text-xs sm:text-sm">Width, Height</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">Number</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">⚪</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">Node dimensions (defaults: 100x50)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 font-mono text-xs sm:text-sm">Color</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">String</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">⚪</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">Hex color code (default: #3b82f6)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 font-mono text-xs sm:text-sm">Shape</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">String</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">⚪</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">rectangle, circle, diamond (default: rectangle)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 font-mono text-xs sm:text-sm">Parent ID</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">String</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">⚪</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">CSV only: Creates connection to parent node</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8" id="tips">
          <h2 className="text-xl sm:text-2xl font-semibold text-blue-900 mb-4">Best Practices</h2>
          <div className="space-y-3 text-blue-800 text-sm sm:text-base">
            <p><strong>✓ Use unique Node IDs:</strong> Each node must have a unique identifier</p>
            <p><strong>✓ Plan your layout:</strong> Consider X,Y coordinates for proper positioning</p>
            <p><strong>✓ Choose appropriate shapes:</strong> rectangle, circle, or diamond</p>
            <p><strong>✓ Use valid hex colors:</strong> Format: #RRGGBB (e.g., #3b82f6)</p>
            <p><strong>✓ CSV hierarchy:</strong> Use Parent ID to create automatic connections</p>
            <p><strong>✓ Test with samples:</strong> Download and modify our sample files</p>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8" id="troubleshooting">
          <h2 className="text-xl sm:text-2xl font-semibold text-red-900 mb-4">Troubleshooting</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-red-900 text-sm sm:text-base">File format not supported</h3>
              <p className="text-xs sm:text-sm text-red-700">Ensure your file has .json or .csv extension and proper format</p>
            </div>
            <div>
              <h3 className="font-medium text-red-900 text-sm sm:text-base">Invalid shape value</h3>
              <p className="text-xs sm:text-sm text-red-700">Use only: rectangle, circle, or diamond</p>
            </div>
            <div>
              <h3 className="font-medium text-red-900 text-sm sm:text-base">Missing required fields</h3>
              <p className="text-xs sm:text-sm text-red-700">Ensure Node ID, Text, X, and Y are provided for all nodes</p>
            </div>
            <div>
              <h3 className="font-medium text-red-900 text-sm sm:text-base">CSV connections not created</h3>
              <p className="text-xs sm:text-sm text-red-700">Verify Parent ID values exactly match existing Node ID values</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}