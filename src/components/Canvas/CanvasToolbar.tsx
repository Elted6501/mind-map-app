import React from 'react';
import { useMindMapStore } from '../../store/mindMapStore';

const CanvasToolbar: React.FC = () => {
  const { canvasState, currentMindMap, selectedNodes, actions } = useMindMapStore();

  const handleCreateNode = () => {
    // Create node at center of visible canvas
    const centerX = (-canvasState.panX + window.innerWidth / 2) / canvasState.zoom;
    const centerY = (-canvasState.panY + window.innerHeight / 2) / canvasState.zoom;
    
    actions.createNode(null, { x: centerX, y: centerY }, 'New Node');
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
    <div className="absolute 
      /* Mobile: Right side vertical toolbar */
      top-2 right-2 flex flex-col gap-1 p-1
      /* Tablet and up: Top center horizontal toolbar */
      sm:top-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:flex-row sm:gap-2 sm:p-2 sm:right-auto
      /* Common styles */
      bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 z-10 
      /* Mobile max height with scroll, Desktop max width with scroll */
      max-h-[50vh] overflow-y-auto sm:max-h-none sm:overflow-y-visible sm:max-w-[90vw] sm:overflow-x-auto">
      
      {/* Add Node */}
      <button
        onClick={handleCreateNode}
        className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors touch-target whitespace-nowrap min-w-[2.5rem] sm:min-w-auto"
        title="Add Node (Double-click canvas)"
      >
        <span>➕</span>
        <span className="hidden md:inline">Add Node</span>
      </button>

      {/* Divider - Horizontal on mobile, Vertical on desktop */}
      <div className="h-px w-4 bg-gray-300 sm:w-px sm:h-6"></div>

      {/* Zoom Controls */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-1">
        <button
          onClick={actions.zoomOut}
          className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors touch-target min-w-[2.5rem] flex items-center justify-center"
          title="Zoom Out"
        >
          🔍-
        </button>
        <span className="text-xs sm:text-sm text-gray-600 min-w-[40px] sm:min-w-[50px] text-center py-1">
          {Math.round(canvasState.zoom * 100)}%
        </span>
        <button
          onClick={actions.zoomIn}
          className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors touch-target min-w-[2.5rem] flex items-center justify-center"
          title="Zoom In"
        >
          🔍+
        </button>
      </div>

      {/* Fit to Screen */}
      <button
        onClick={handleZoomToFit}
        className="hidden sm:block p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors touch-target"
        title="Fit to Screen"
      >
        📐
      </button>

      {/* Divider - Horizontal on mobile, Vertical on desktop */}
      <div className="h-px w-4 bg-gray-300 sm:w-px sm:h-6"></div>

      {/* Delete Selected */}
      {selectedNodes.length > 0 && (
        <button
          onClick={() => actions.deleteNode(selectedNodes)}
          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors touch-target min-w-[2.5rem] flex items-center justify-center"
          title={`Delete ${selectedNodes.length} selected node(s)`}
        >
          🗑️
        </button>
      )}

      {/* Save */}
      <button
        onClick={actions.saveMindMap}
        className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors touch-target whitespace-nowrap min-w-[2.5rem] sm:min-w-auto"
  title="Save Mind Mapping"
      >
        <span>💾</span>
        <span className="hidden md:inline">Save</span>
      </button>
    </div>
  );
};

export default CanvasToolbar;