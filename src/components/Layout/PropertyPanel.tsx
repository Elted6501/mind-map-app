import React from 'react';
import { useMindMapStore } from '../../store/mindMapStore';

const PropertyPanel: React.FC = () => {
  const { selectedNodes, currentMindMap, actions } = useMindMapStore();

  const selectedNode = selectedNodes.length === 1 
    ? currentMindMap?.nodes.find(node => node.id === selectedNodes[0])
    : null;

  return (
    <div className="h-full bg-gray-50 border-l border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Properties</h2>

      {selectedNode ? (
        <div className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <input
              type="color"
              value={selectedNode.style.backgroundColor || '#3B82F6'}
              onChange={(e) => actions.updateNode(selectedNode.id, { 
                style: { ...selectedNode.style, backgroundColor: e.target.value }
              })}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">X</label>
                <input
                  type="number"
                  value={Math.round(selectedNode.x)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Y</label>
                <input
                  type="number"
                  value={Math.round(selectedNode.y)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  readOnly
                />
              </div>
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