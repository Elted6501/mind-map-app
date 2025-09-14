import React from 'react';
import { Undo, Redo, RotateCcw, Trash2, Grid3X3, Magnet } from 'lucide-react';
import { useMindMapStore } from '../../store/mindMapStore';
const CanvasToolbar: React.FC = () => {
  const { canvasState, selectedNodes, actions } = useMindMapStore();

  const handleDeleteNodes = () => {
    // Use the exact same logic as keyboard delete in Canvas.tsx
    const activeElement = document.activeElement;
    const isEditingText = 
      activeElement?.tagName === 'INPUT' || 
      activeElement?.tagName === 'TEXTAREA' ||
      activeElement?.getAttribute('contenteditable') === 'true';
      
    if (selectedNodes.length > 0 && !isEditingText) {
      actions.deleteNode(selectedNodes);
    }
  };

  const handleCreateNode = () => {
    // Create node at center of visible canvas
    const centerX = (-canvasState.panX + window.innerWidth / 2) / canvasState.zoom;
    const centerY = (-canvasState.panY + window.innerHeight / 2) / canvasState.zoom;
    
    actions.createNode(null, { x: centerX, y: centerY }, 'New Node');
  };

  return (
        <div className="absolute
      top-4 right-2 flex flex-col items-center gap-1 p-1
      sm:top-6 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:flex-row sm:items-center sm:gap-2 sm:p-2 sm:right-auto
      bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 z-10 
      h-auto max-h-[200px] overflow-y-auto overflow-x-hidden
      sm:h-auto sm:max-h-[80px] sm:overflow-y-hidden sm:overflow-x-auto sm:max-w-[90vw]
      scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      data-toolbar="true"
    >
      
      {/* History Actions */}
      <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-1">
        <button
          onClick={actions.undo}
          className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors touch-target min-w-[2.5rem] flex items-center justify-center disabled:text-gray-400 disabled:cursor-not-allowed"
          title="Undo"
          disabled={!actions.canUndo()}
        >
          <Undo className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={actions.redo}
          className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors touch-target min-w-[2.5rem] flex items-center justify-center disabled:text-gray-400 disabled:cursor-not-allowed"
          title="Redo"
          disabled={!actions.canRedo()}
        >
          <Redo className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-px w-4 bg-gray-300 sm:w-px sm:h-6 self-center"></div>

      {/* Add Node */}
      <button
        onClick={handleCreateNode}
        className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors touch-target whitespace-nowrap min-w-[2.5rem] sm:min-w-auto"
        title="Add Node (Double-click canvas)"
      >
        <span>➕</span>
        <span className="hidden md:inline">Add Node</span>
      </button>

      {/* Divider */}
      <div className="h-px w-4 bg-gray-300 sm:w-px sm:h-6 self-center"></div>

      {/* Zoom Controls */}
      <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-1">
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
        <button
          onClick={actions.resetZoom}
          className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors touch-target min-w-[2.5rem] flex items-center justify-center"
          title="Reset Zoom"
        >
          <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Grid Controls */}
      <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-1">
        <button
          onClick={() => actions.updateCanvas({ showGrid: !canvasState.showGrid })}
          className={`p-1.5 sm:p-2 rounded-md transition-colors touch-target min-w-[2.5rem] flex items-center justify-center ${
            canvasState.showGrid 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={`${canvasState.showGrid ? 'Hide' : 'Show'} Grid`}
        >
          <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => actions.updateCanvas({ snapToGrid: !canvasState.snapToGrid })}
          className={`p-1.5 sm:p-2 rounded-md transition-colors touch-target min-w-[2.5rem] flex items-center justify-center ${
            canvasState.snapToGrid 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={`${canvasState.snapToGrid ? 'Disable' : 'Enable'} Snap to Grid`}
        >
          <Magnet className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Delete Selected */}
      {selectedNodes.length > 0 && (
        <>
          <div className="h-px w-4 bg-gray-300 sm:w-px sm:h-6 self-center"></div>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteNodes();
            }}
            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors touch-target min-w-[2.5rem] flex items-center justify-center"
            title={`Delete ${selectedNodes.length} selected node(s)`}
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </>
      )}
    </div>
  );
};

export default CanvasToolbar;