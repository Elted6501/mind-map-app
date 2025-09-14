import React from 'react';
import { useMindMapStore } from '../../store/mindMapStore';
import { NodeType } from '../../types';

const PropertyPanel: React.FC = () => {
  const { selectedNodes, currentMindMap, actions } = useMindMapStore();

  const selectedNode = selectedNodes.length === 1 
    ? currentMindMap?.nodes.find(node => node.id === selectedNodes[0])
    : null;

  return (
    <div className="h-full bg-white/90 backdrop-blur-sm border-l border-gray-200 p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Properties</h2>

      {selectedNode ? (
        <div className="space-y-6">
          {/* Basic Properties */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Node Text
            </label>
            <input
              type="text"
              value={selectedNode.text}
              onChange={(e) => actions.updateNode(selectedNode.id, { text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter node text..."
            />
          </div>

          {/* Node Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Node Type
            </label>
            <select
              value={selectedNode.type}
              onChange={(e) => actions.updateNode(selectedNode.id, { 
                type: e.target.value as NodeType
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="root">🌟 Root</option>
              <option value="branch">📁 Branch</option>
              <option value="leaf">📄 Leaf</option>
              <option value="note">📝 Note</option>
              <option value="task">✅ Task</option>
              <option value="link">🔗 Link</option>
            </select>
          </div>

          {/* Appearance */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Appearance</h3>
            
            {/* Colors */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Background
                </label>
                <input
                  type="color"
                  value={selectedNode.style.backgroundColor || '#3B82F6'}
                  onChange={(e) => actions.updateNode(selectedNode.id, { 
                    style: { ...selectedNode.style, backgroundColor: e.target.value }
                  })}
                  className="w-full h-8 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Text Color
                </label>
                <input
                  type="color"
                  value={selectedNode.style.textColor || '#1F2937'}
                  onChange={(e) => actions.updateNode(selectedNode.id, { 
                    style: { ...selectedNode.style, textColor: e.target.value }
                  })}
                  className="w-full h-8 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Font Size */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Font Size: {selectedNode.style.fontSize || 14}px
              </label>
              <input
                type="range"
                min="10"
                max="24"
                value={selectedNode.style.fontSize || 14}
                onChange={(e) => actions.updateNode(selectedNode.id, { 
                  style: { ...selectedNode.style, fontSize: parseInt(e.target.value) }
                })}
                className="w-full"
              />
            </div>

            {/* Font Weight */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Font Weight
              </label>
              <select
                value={selectedNode.style.fontWeight || 'normal'}
                onChange={(e) => actions.updateNode(selectedNode.id, { 
                  style: { ...selectedNode.style, fontWeight: e.target.value }
                })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="semibold">Semi Bold</option>
                <option value="bold">Bold</option>
              </select>
            </div>

            {/* Shape */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Shape
              </label>
              <select
                value={selectedNode.style.shape || 'rectangle'}
                onChange={(e) => actions.updateNode(selectedNode.id, { 
                  style: { ...selectedNode.style, shape: e.target.value as 'rectangle' | 'circle' }
                })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
              >
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
              </select>
            </div>
          </div>

          {/* Border */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Border</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Border Color
                </label>
                <input
                  type="color"
                  value={selectedNode.style.borderColor || '#D1D5DB'}
                  onChange={(e) => actions.updateNode(selectedNode.id, { 
                    style: { ...selectedNode.style, borderColor: e.target.value }
                  })}
                  className="w-full h-8 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Width: {selectedNode.style.borderWidth || 1}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={selectedNode.style.borderWidth || 1}
                  onChange={(e) => actions.updateNode(selectedNode.id, { 
                    style: { ...selectedNode.style, borderWidth: parseInt(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Border Radius: {selectedNode.style.borderRadius || 8}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={selectedNode.style.borderRadius || 8}
                onChange={(e) => actions.updateNode(selectedNode.id, { 
                  style: { ...selectedNode.style, borderRadius: parseInt(e.target.value) }
                })}
                className="w-full"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Dimensions (Grid Units)</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Width: {Math.round(selectedNode.width / 20)} units
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={Math.round(selectedNode.width / 20)}
                  onChange={(e) => {
                    const units = parseInt(e.target.value);
                    const newWidth = units * 20; // 20px per grid unit
                    actions.updateNode(selectedNode.id, { width: newWidth });
                  }}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Height: {Math.round(selectedNode.height / 20)} units
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={Math.round(selectedNode.height / 20)}
                  onChange={(e) => {
                    const units = parseInt(e.target.value);
                    const newHeight = units * 20; // 20px per grid unit
                    actions.updateNode(selectedNode.id, { height: newHeight });
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <p>💡 Each unit = 20px</p>
              <p>Current size: {selectedNode.width}×{selectedNode.height}px</p>
            </div>
          </div>
        </div>
      ) : selectedNodes.length > 1 ? (
        <div className="text-center text-gray-500">
          <p>Multiple nodes selected</p>
          <p className="text-sm mt-1">{selectedNodes.length} nodes</p>
        </div>
      ) : (
        <div className="text-center text-gray-500">
          <p>No node selected</p>
          <p className="text-sm mt-1">Select a node to view its properties</p>
        </div>
      )}
    </div>
  );
};

export default PropertyPanel;