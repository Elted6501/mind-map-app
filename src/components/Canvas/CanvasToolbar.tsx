import React from 'react';
import { useMindMapStore } from '../../store/mindMapStore';
import { NodeType } from '../../types';

const CanvasToolbar: React.FC = () => {
  const { canvasState, currentMindMap, selectedNodes, actions } = useMindMapStore();

  const handleCreateNode = (nodeType: NodeType = NodeType.BRANCH) => {
    // Create node at center of visible canvas
    const centerX = (-canvasState.panX + window.innerWidth / 2) / canvasState.zoom;
    const centerY = (-canvasState.panY + window.innerHeight / 2) / canvasState.zoom;
    
    const newNode = actions.createNode(null, { x: centerX, y: centerY }, 'New Node');
    
    // Optionally update node type after creation if different from default
    if (nodeType !== NodeType.BRANCH && newNode) {
      // This would need to be implemented in the store
      console.log(`Node type ${nodeType} requested but not yet implemented`);
    }
  };

  const handleZoomToFit = () => {
    if (!currentMindMap || currentMindMap.nodes.length === 0) return;

    // Calculate bounds of all nodes
    const nodes = currentMindMap.nodes;
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x + n.width));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y + n.height));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const padding = 100;

    const scaleX = (window.innerWidth - padding * 2) / contentWidth;
    const scaleY = (window.innerHeight - padding * 2) / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, 1);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const newPanX = window.innerWidth / 2 - centerX * newZoom;
    const newPanY = window.innerHeight / 2 - centerY * newZoom;

    actions.updateCanvas({
      zoom: newZoom,
      panX: newPanX,
      panY: newPanY
    });
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 flex items-center gap-2 p-2 z-10">
      {/* Add Node */}
      <button
        onClick={() => handleCreateNode()}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors touch-target"
        title="Add Node (Double-click canvas)"
      >
        <span>➕</span>
        <span className="hidden sm:inline">Add Node</span>
      </button>

      {/* Node Type Selector */}
      <div className="hidden md:flex items-center gap-1">
        <button
          onClick={() => handleCreateNode(NodeType.NOTE)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors touch-target"
          title="Add Note"
        >
          📝
        </button>
        <button
          onClick={() => handleCreateNode(NodeType.TASK)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors touch-target"
          title="Add Task"
        >
          ✅
        </button>
        <button
          onClick={() => handleCreateNode(NodeType.LINK)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors touch-target"
          title="Add Link"
        >
          🔗
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={actions.zoomOut}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors touch-target"
          title="Zoom Out"
        >
          🔍-
        </button>
        <span className="text-sm text-gray-600 min-w-[50px] text-center">
          {Math.round(canvasState.zoom * 100)}%
        </span>
        <button
          onClick={actions.zoomIn}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors touch-target"
          title="Zoom In"
        >
          🔍+
        </button>
      </div>

      {/* Fit to Screen */}
      <button
        onClick={handleZoomToFit}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors touch-target"
        title="Fit to Screen"
      >
        📐
      </button>

      {/* Reset Zoom */}
      <button
        onClick={actions.resetZoom}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors touch-target"
        title="Reset Zoom (100%)"
      >
        🎯
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Delete Selected */}
      {selectedNodes.length > 0 && (
        <button
          onClick={() => actions.deleteNode(selectedNodes)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors touch-target"
          title={`Delete ${selectedNodes.length} selected node(s)`}
        >
          🗑️
        </button>
      )}

      {/* Save */}
      <button
        onClick={actions.saveMindMap}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors touch-target"
        title="Save Mind Map"
      >
        <span>💾</span>
        <span className="hidden sm:inline">Save</span>
      </button>
    </div>
  );
};

export default CanvasToolbar;