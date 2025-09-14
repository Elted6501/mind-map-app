import { useMindMapStore } from '../../store/mindMapStore';
import { useEffect, useState } from 'react';

export const Minimap = () => {
  const { canvasState, currentMindMap, actions } = useMindMapStore();
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  const centerCanvas = () => {
    actions.updateCanvas({
      panX: 0,
      panY: 0,
      zoom: 1
    });
  };
  
  // Minimap dimensions
  const minimapWidth = 160;
  const minimapHeight = 120;
  
  // Calculate scale factors for the minimap
  const { bounds } = canvasState;
  const totalWidth = bounds.maxX - bounds.minX;
  const totalHeight = bounds.maxY - bounds.minY;
  
  // Calculate viewport position in world coordinates
  const viewportWidth = windowSize.width / canvasState.zoom;
  const viewportHeight = windowSize.height / canvasState.zoom;
  const viewportX = -canvasState.panX / canvasState.zoom;
  const viewportY = -canvasState.panY / canvasState.zoom;
  
  // Scale to minimap coordinates
  const scaleX = minimapWidth / totalWidth;
  const scaleY = minimapHeight / totalHeight;
  
  // Viewport rectangle in minimap coordinates
  const viewportRect = {
    x: (viewportX - bounds.minX) * scaleX,
    y: (viewportY - bounds.minY) * scaleY,
    width: viewportWidth * scaleX,
    height: viewportHeight * scaleY
  };
  
  // Node positions in minimap coordinates
  const nodePositions = currentMindMap?.nodes.map(node => ({
    x: (node.x - bounds.minX) * scaleX,
    y: (node.y - bounds.minY) * scaleY,
    id: node.id
  })) || [];

  return (
    <div className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg p-1 sm:p-2 shadow-lg z-10 hidden md:block">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-gray-600">Canvas View</div>
        <button 
          onClick={centerCanvas}
          className="text-xs px-1.5 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
          title="Center canvas"
        >
          🏠
        </button>
      </div>
      <div 
        className="relative bg-gray-100 border border-gray-200 rounded"
        style={{ width: minimapWidth, height: minimapHeight }}
      >
        {/* Virtual canvas bounds */}
        <div className="absolute inset-0 bg-gray-50" />
        
        {/* Nodes */}
        {nodePositions.map(node => (
          <div
            key={node.id}
            className="absolute w-1 h-1 bg-blue-500 rounded-full"
            style={{
              left: node.x - 0.5,
              top: node.y - 0.5,
            }}
          />
        ))}
        
        {/* Current viewport */}
        <div
          className="absolute border-2 border-blue-600 bg-blue-600/20 rounded"
          style={{
            left: Math.max(0, Math.min(minimapWidth - viewportRect.width, viewportRect.x)),
            top: Math.max(0, Math.min(minimapHeight - viewportRect.height, viewportRect.y)),
            width: Math.min(minimapWidth, viewportRect.width),
            height: Math.min(minimapHeight, viewportRect.height),
          }}
        />
        
        {/* Center indicator */}
        <div 
          className="absolute w-1 h-1 bg-red-500 rounded-full"
          style={{
            left: minimapWidth / 2 - 0.5,
            top: minimapHeight / 2 - 0.5,
          }}
        />
      </div>
      
      {/* Position info - Hidden on smaller screens */}
      <div className="text-xs text-gray-500 mt-1 hidden lg:block">
        <div>Pan: ({Math.round(-canvasState.panX)}, {Math.round(-canvasState.panY)})</div>
        <div>Zoom: {Math.round(canvasState.zoom * 100)}%</div>
      </div>
    </div>
  );
};