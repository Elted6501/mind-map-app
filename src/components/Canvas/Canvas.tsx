import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useMindMapStore } from '../../store/mindMapStore';
import { Node, Connection, Point } from '../../types';
import NodeComponent from './Node';
import ConnectionComponent from './Connection';
import CanvasToolbar from './CanvasToolbar';

interface DragState {
  isDragging: boolean;
  dragType: 'node' | 'canvas' | 'connection' | null;
  startPos: Point;
  currentPos: Point;
  draggedNodeId?: string;
  connectionStart?: string;
}

const Canvas: React.FC = () => {
  const {
    currentMindMap,
    canvasState,
    selectedNodes,
    editingNode,
    actions
  } = useMindMapStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 }
  });
  const [connectionMode, setConnectionMode] = useState<{
    active: boolean;
    startNodeId?: string;
    currentPos?: Point;
  }>({ active: false });

  // Handle connection creation
  const handleStartConnection = useCallback((nodeId: string) => {
    setConnectionMode({
      active: true,
      startNodeId: nodeId
    });
  }, []);

  const handleFinishConnection = useCallback((targetNodeId: string) => {
    if (connectionMode.active && connectionMode.startNodeId && 
        connectionMode.startNodeId !== targetNodeId) {
      actions.createConnection(connectionMode.startNodeId, targetNodeId);
    }
    setConnectionMode({ active: false });
  }, [connectionMode, actions]);

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const point = {
      x: (e.clientX - rect.left - canvasState.panX) / canvasState.zoom,
      y: (e.clientY - rect.top - canvasState.panY) / canvasState.zoom
    };

    // Check if clicking on a node
    const clickedNode = currentMindMap?.nodes.find(node => 
      point.x >= node.x && 
      point.x <= node.x + node.width &&
      point.y >= node.y && 
      point.y <= node.y + node.height
    );

    if (clickedNode) {
      // Handle connection completion
      if (connectionMode.active && connectionMode.startNodeId) {
        handleFinishConnection(clickedNode.id);
        return;
      }

      // Handle node selection and dragging
      if (!selectedNodes.includes(clickedNode.id)) {
        actions.selectNodes([clickedNode.id]);
      }
      
      setDragState({
        isDragging: true,
        dragType: 'node',
        startPos: point,
        currentPos: point,
        draggedNodeId: clickedNode.id
      });
    } else {
      // Cancel connection mode
      if (connectionMode.active) {
        setConnectionMode({ active: false });
        return;
      }

      // Handle canvas panning or area selection
      actions.clearSelection();
      setDragState({
        isDragging: true,
        dragType: 'canvas',
        startPos: point,
        currentPos: point
      });
    }
  }, [currentMindMap, canvasState, selectedNodes, actions, connectionMode, handleFinishConnection]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const point = {
      x: (e.clientX - rect.left - canvasState.panX) / canvasState.zoom,
      y: (e.clientY - rect.top - canvasState.panY) / canvasState.zoom
    };

    // Update connection mode cursor position
    if (connectionMode.active) {
      setConnectionMode(prev => ({ ...prev, currentPos: point }));
    }

    if (!dragState.isDragging) return;

    setDragState(prev => ({ ...prev, currentPos: point }));

    if (dragState.dragType === 'node' && dragState.draggedNodeId) {
      // Update node position
      const deltaX = point.x - dragState.startPos.x;
      const deltaY = point.y - dragState.startPos.y;
      
      const currentNode = currentMindMap?.nodes.find(n => n.id === dragState.draggedNodeId);
      if (currentNode) {
        actions.moveNodes([{
          nodeId: dragState.draggedNodeId,
          fromX: currentNode.x,
          fromY: currentNode.y,
          toX: currentNode.x + deltaX,
          toY: currentNode.y + deltaY
        }]);
      }
    } else if (dragState.dragType === 'canvas') {
      // Pan the canvas
      const deltaX = (point.x - dragState.startPos.x) * canvasState.zoom;
      const deltaY = (point.y - dragState.startPos.y) * canvasState.zoom;
      
      actions.updateCanvas({
        panX: canvasState.panX + deltaX,
        panY: canvasState.panY + deltaY
      });
    }
  }, [dragState, canvasState, connectionMode, actions, currentMindMap]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      dragType: null,
      startPos: { x: 0, y: 0 },
      currentPos: { x: 0, y: 0 }
    });
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConnectionMode({ active: false });
        actions.clearSelection();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodes.length > 0) {
          actions.deleteNode(selectedNodes);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, actions]);

  // Handle double-click to create nodes
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const point = {
      x: (e.clientX - rect.left - canvasState.panX) / canvasState.zoom,
      y: (e.clientY - rect.top - canvasState.panY) / canvasState.zoom
    };

    // Check if double-clicking on a node to edit
    const clickedNode = currentMindMap?.nodes.find(node => 
      point.x >= node.x && 
      point.x <= node.x + node.width &&
      point.y >= node.y && 
      point.y <= node.y + node.height
    );

    if (clickedNode) {
      actions.startEditingNode(clickedNode.id);
    } else {
      // Create a new node
      actions.createNode(null, point, 'New Node');
    }
  }, [currentMindMap, canvasState, actions]);

  // Handle wheel events for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    if (e.deltaY < 0) {
      actions.zoomIn();
    } else {
      actions.zoomOut();
    }
  }, [actions]);

  // Render a node
  const renderNode = useCallback((node: Node) => {
    const isSelected = selectedNodes.includes(node.id);
    const isEditing = editingNode === node.id;

    return (
      <NodeComponent
        key={node.id}
        node={node}
        isSelected={isSelected}
        isEditing={isEditing}
        zoom={canvasState.zoom}
        onStartConnection={handleStartConnection}
      />
    );
  }, [selectedNodes, editingNode, canvasState.zoom, handleStartConnection]);

  // Render a connection
  const renderConnection = useCallback((connection: Connection) => {
    const fromNode = currentMindMap?.nodes.find(n => n.id === connection.fromNodeId);
    const toNode = currentMindMap?.nodes.find(n => n.id === connection.toNodeId);
    
    if (!fromNode || !toNode) return null;

    return (
      <ConnectionComponent
        key={connection.id}
        connection={connection}
        fromNode={fromNode}
        toNode={toNode}
        zoom={canvasState.zoom}
      />
    );
  }, [currentMindMap, canvasState.zoom]);

  if (!currentMindMap) {
    return (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-xl font-semibold mb-2">No Mind Map Loaded</h2>
          <p className="text-gray-400">Create or load a mind map to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={canvasRef}
      className="w-full h-full bg-gray-50 relative overflow-hidden cursor-move"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      style={{
        transform: `translate(${canvasState.panX}px, ${canvasState.panY}px)`
      }}
    >
      {/* Canvas Toolbar */}
      <CanvasToolbar />

      {/* Grid background */}
      {canvasState.showGrid && (
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: `${canvasState.gridSize * canvasState.zoom}px ${canvasState.gridSize * canvasState.zoom}px`
          }}
        />
      )}

      {/* Connections */}
      <svg 
        className="absolute inset-0 pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${canvasState.zoom})`,
          transformOrigin: 'top left'
        }}
      >
        {currentMindMap.connections.map(renderConnection)}
        
        {/* Connection preview line */}
        {connectionMode.active && connectionMode.startNodeId && connectionMode.currentPos && (
          (() => {
            const startNode = currentMindMap.nodes.find(n => n.id === connectionMode.startNodeId);
            if (!startNode) return null;
            
            const startX = startNode.x + startNode.width / 2;
            const startY = startNode.y + startNode.height / 2;
            
            return (
              <line
                x1={startX}
                y1={startY}
                x2={connectionMode.currentPos.x}
                y2={connectionMode.currentPos.y}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="4,4"
                opacity={0.7}
              />
            );
          })()
        )}
      </svg>

      {/* Nodes */}
      <div className="relative">
        {currentMindMap.nodes.map(renderNode)}
      </div>

      {/* Canvas info overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-gray-600 shadow-lg">
        <div>Zoom: {Math.round(canvasState.zoom * 100)}%</div>
        <div>Nodes: {currentMindMap.nodes.length}</div>
        <div>Connections: {currentMindMap.connections.length}</div>
      </div>

      {/* Help text */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-500 shadow-lg max-w-64">
        <div>• Double-click: Create/Edit node</div>
        <div>• Drag: Move node or pan canvas</div>
        <div>• Scroll: Zoom in/out</div>
        <div>• Click: Select nodes</div>
        <div>• Blue handles: Create connections</div>
        <div>• Delete/Backspace: Delete selected</div>
        <div>• Esc: Cancel/Deselect</div>
        {connectionMode.active && (
          <div className="mt-2 text-blue-600 font-medium">
            🔗 Click a node to connect
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;