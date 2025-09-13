import React from 'react';
import { useMindMapStore } from '../../store/mindMapStore';

const Canvas: React.FC = () => {
  const { currentMindMap, canvasState } = useMindMapStore();

  return (
    <div className="w-full h-full bg-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-xl font-semibold mb-2">Mind Map Canvas</h2>
          <p className="text-gray-400">
            {currentMindMap ? (
              <>
                Canvas for "{currentMindMap.title}"<br />
                <span className="text-sm">
                  Zoom: {Math.round(canvasState.zoom * 100)}% | 
                  Nodes: {currentMindMap.nodes?.length || 0} | 
                  Connections: {currentMindMap.connections?.length || 0}
                </span>
              </>
            ) : (
              'No mind map loaded'
            )}
          </p>
          
          <div className="mt-6 text-sm text-gray-400">
            <p>Canvas component will be implemented with:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Drag & drop nodes</li>
              <li>Node creation and editing</li>
              <li>Connection drawing</li>
              <li>Zoom and pan controls</li>
              <li>Selection and multi-select</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Canvas;