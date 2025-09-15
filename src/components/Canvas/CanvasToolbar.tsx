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

  // Common button event handlers for mobile compatibility
  const createButtonHandler = (action: () => void) => ({
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      action();
    },
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      action();
    }
  });

  return (
    <div className="absolute
      top-4 right-2 flex flex-col items-center gap-2 p-2
      sm:top-6 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:flex-row sm:items-center sm:gap-3 sm:p-3 sm:right-auto
      bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 z-10 
      h-auto max-h-[300px] overflow-y-auto overflow-x-hidden
      sm:h-auto sm:max-h-[80px] sm:overflow-y-hidden sm:overflow-x-auto sm:max-w-[90vw]
      scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      data-toolbar="true"
      style={{ touchAction: 'manipulation' }} // Improve touch responsiveness
    >
      
      {/* History Actions */}
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-2">
        <button
          {...createButtonHandler(actions.undo)}
          className="p-3 sm:p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors min-w-[3rem] min-h-[3rem] sm:min-w-[2.75rem] sm:min-h-[2.75rem] flex items-center justify-center disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          title="Undo"
          disabled={!actions.canUndo()}
        >
          <Undo className="w-4 h-4 sm:w-4 sm:h-4" />
        </button>
        <button
          {...createButtonHandler(actions.redo)}
          className="p-3 sm:p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors min-w-[3rem] min-h-[3rem] sm:min-w-[2.75rem] sm:min-h-[2.75rem] flex items-center justify-center disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          title="Redo"
          disabled={!actions.canRedo()}
        >
          <Redo className="w-4 h-4 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-px w-6 bg-gray-300 sm:w-px sm:h-8 self-center"></div>

      {/* Add Node */}
      <button
        {...createButtonHandler(handleCreateNode)}
        className="flex items-center justify-center gap-2 px-3 py-3 sm:px-3 sm:py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors whitespace-nowrap min-w-[3rem] min-h-[3rem] sm:min-w-auto sm:min-h-[2.75rem]"
        title="Add Node (Double-click canvas)"
      >
        <span className="text-base">➕</span>
        <span className="hidden md:inline">Add Node</span>
      </button>

      {/* Divider */}
      <div className="h-px w-6 bg-gray-300 sm:w-px sm:h-8 self-center"></div>

      {/* Zoom Controls */}
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-2">
        <button
          {...createButtonHandler(actions.zoomOut)}
          className="p-3 sm:p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors min-w-[3rem] min-h-[3rem] sm:min-w-[2.75rem] sm:min-h-[2.75rem] flex items-center justify-center text-base"
          title="Zoom Out"
        >
          🔍-
        </button>
        <span className="text-sm text-gray-600 min-w-[50px] text-center py-1 select-none">
          {Math.round(canvasState.zoom * 100)}%
        </span>
        <button
          {...createButtonHandler(actions.zoomIn)}
          className="p-3 sm:p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors min-w-[3rem] min-h-[3rem] sm:min-w-[2.75rem] sm:min-h-[2.75rem] flex items-center justify-center text-base"
          title="Zoom In"
        >
          🔍+
        </button>
        <button
          {...createButtonHandler(actions.resetZoom)}
          className="p-3 sm:p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors min-w-[3rem] min-h-[3rem] sm:min-w-[2.75rem] sm:min-h-[2.75rem] flex items-center justify-center"
          title="Reset Zoom"
        >
          <RotateCcw className="w-4 h-4 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Grid Controls */}
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-2">
        <button
          {...createButtonHandler(() => actions.updateCanvas({ showGrid: !canvasState.showGrid }))}
          className={`p-3 sm:p-2 rounded-md transition-colors min-w-[3rem] min-h-[3rem] sm:min-w-[2.75rem] sm:min-h-[2.75rem] flex items-center justify-center ${
            canvasState.showGrid 
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
              : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
          }`}
          title={`${canvasState.showGrid ? 'Hide' : 'Show'} Grid`}
        >
          <Grid3X3 className="w-4 h-4 sm:w-4 sm:h-4" />
        </button>
        <button
          {...createButtonHandler(() => actions.updateCanvas({ snapToGrid: !canvasState.snapToGrid }))}
          className={`p-3 sm:p-2 rounded-md transition-colors min-w-[3rem] min-h-[3rem] sm:min-w-[2.75rem] sm:min-h-[2.75rem] flex items-center justify-center ${
            canvasState.snapToGrid 
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
              : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
          }`}
          title={`${canvasState.snapToGrid ? 'Disable' : 'Enable'} Snap to Grid`}
        >
          <Magnet className="w-4 h-4 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Delete Selected */}
      {selectedNodes.length > 0 && (
        <>
          <div className="h-px w-6 bg-gray-300 sm:w-px sm:h-8 self-center"></div>
          <button
            {...createButtonHandler(handleDeleteNodes)}
            className="p-3 sm:p-2 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-md transition-colors min-w-[3rem] min-h-[3rem] sm:min-w-[2.75rem] sm:min-h-[2.75rem] flex items-center justify-center"
            title={`Delete ${selectedNodes.length} selected node(s)`}
          >
            <Trash2 className="w-4 h-4 sm:w-4 sm:h-4" />
          </button>
        </>
      )}
    </div>
  );
};

export default CanvasToolbar;