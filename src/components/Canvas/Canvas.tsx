import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useMindMapStore } from '../../store/mindMapStore';
import { Node, Connection, Point } from '../../types';
import NodeComponent from './Node';
import ConnectionComponent from './Connection';
import CanvasToolbar from './CanvasToolbar';
import { Minimap } from './Minimap';

interface DragState {
  isDragging: boolean;
  dragType: 'node' | 'canvas' | 'connection' | null;
  startPos: Point;
  currentPos: Point;
  draggedNodeId?: string;
  connectionStart?: string;
  originalNodePos?: Point;
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
  const [isPanMode, setIsPanMode] = useState(false);

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

  // Handle node dragging
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Use raw screen coordinates for dragging - will convert to world coordinates in move handler
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Handle connection mode
    if (connectionMode.active && connectionMode.startNodeId) {
      if (connectionMode.startNodeId !== nodeId) {
        handleFinishConnection(nodeId);
      }
      return;
    }

    // Handle node selection and start dragging
    if (!selectedNodes.includes(nodeId)) {
      actions.selectNodes([nodeId]);
    }
    
    setDragState({
      isDragging: true,
      dragType: 'node',
      startPos: point,
      currentPos: point,
      draggedNodeId: nodeId,
      originalNodePos: undefined // Will be set on first move
    });
  }, [canvasState, connectionMode, selectedNodes, actions, handleFinishConnection]);

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Transform mouse coordinates to world space for hit detection
    const screenPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    // Convert screen point to world coordinates for hit detection
    const worldPoint = {
      x: (screenPoint.x - canvasState.panX) / canvasState.zoom,
      y: (screenPoint.y - canvasState.panY) / canvasState.zoom
    };

    // Screen coordinates for canvas panning
    const screenCoords = {
      x: e.clientX,
      y: e.clientY
    };

    // Check if clicking on a node using world coordinates
    const clickedNode = currentMindMap?.nodes.find(node => 
      worldPoint.x >= node.x && 
      worldPoint.x <= node.x + node.width &&
      worldPoint.y >= node.y && 
      worldPoint.y <= node.y + node.height
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
        startPos: screenPoint,
        currentPos: screenPoint,
        draggedNodeId: clickedNode.id
      });
    } else {
      // Cancel connection mode
      if (connectionMode.active) {
        setConnectionMode({ active: false });
        return;
      }

      // Enable canvas panning directly on empty canvas or with spacebar/middle mouse
      // Left click on empty space = canvas panning
      // Spacebar + drag = canvas panning  
      // Middle mouse = canvas panning
      if (e.button === 0 || isPanMode || e.button === 1) {
        if (e.button === 1) e.preventDefault(); // Prevent middle mouse scroll
        actions.clearSelection();
        setDragState({
          isDragging: true,
          dragType: 'canvas',
          startPos: screenCoords,
          currentPos: screenCoords
        });
      }
    }
  }, [currentMindMap, canvasState, selectedNodes, actions, connectionMode, handleFinishConnection]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Screen coordinates relative to canvas
    const screenPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Screen coordinates for canvas panning
    const screenCoords = {
      x: e.clientX,
      y: e.clientY
    };

    // Update connection mode cursor position (needs world coordinates)
    if (connectionMode.active) {
      const worldPoint = {
        x: (screenPoint.x - canvasState.panX) / canvasState.zoom,
        y: (screenPoint.y - canvasState.panY) / canvasState.zoom
      };
      setConnectionMode(prev => ({ ...prev, currentPos: worldPoint }));
    }

    if (!dragState.isDragging) return;

    if (dragState.dragType === 'canvas') {
      setDragState(prev => ({ ...prev, currentPos: screenCoords }));
    } else {
      setDragState(prev => ({ ...prev, currentPos: screenPoint }));
    }

    if (dragState.dragType === 'node' && dragState.draggedNodeId) {
      // Calculate delta in screen space, then convert to world space
      const deltaScreenX = screenPoint.x - dragState.startPos.x;
      const deltaScreenY = screenPoint.y - dragState.startPos.y;
      
      // Convert screen delta to world delta
      const deltaWorldX = deltaScreenX / canvasState.zoom;
      const deltaWorldY = deltaScreenY / canvasState.zoom;
      
      const currentNode = currentMindMap?.nodes.find(n => n.id === dragState.draggedNodeId);
      if (currentNode) {
        // Store the original position when dragging starts
        if (!dragState.originalNodePos) {
          setDragState(prev => ({
            ...prev,
            originalNodePos: { x: currentNode.x, y: currentNode.y }
          }));
        }
        
        const originalPos = dragState.originalNodePos || { x: currentNode.x, y: currentNode.y };
        
        actions.updateNode(dragState.draggedNodeId, {
          x: originalPos.x + deltaWorldX,
          y: originalPos.y + deltaWorldY
        });
      }
    } else if (dragState.dragType === 'canvas') {
      // Pan the canvas with boundary constraints using screen coordinates
      const deltaX = dragState.currentPos.x - dragState.startPos.x;
      const deltaY = dragState.currentPos.y - dragState.startPos.y;
      
      // Calculate new pan values
      const newPanX = canvasState.panX + deltaX;
      const newPanY = canvasState.panY + deltaY;
      
      // Apply boundary constraints based on virtual canvas bounds
      const { bounds } = canvasState;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate the effective boundaries considering zoom and viewport size
      const minPanX = -(bounds.maxX * canvasState.zoom - viewportWidth / 2);
      const maxPanX = -(bounds.minX * canvasState.zoom - viewportWidth / 2);
      const minPanY = -(bounds.maxY * canvasState.zoom - viewportHeight / 2);
      const maxPanY = -(bounds.minY * canvasState.zoom - viewportHeight / 2);
      
      // Constrain the pan values
      const constrainedPanX = Math.max(minPanX, Math.min(maxPanX, newPanX));
      const constrainedPanY = Math.max(minPanY, Math.min(maxPanY, newPanY));
      
      actions.updateCanvas({
        panX: constrainedPanX,
        panY: constrainedPanY
      });
      
      // Update drag start position for smooth movement
      setDragState(prev => ({
        ...prev,
        startPos: dragState.currentPos
      }));
    }
  }, [dragState, canvasState, connectionMode, actions, currentMindMap]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      dragType: null,
      startPos: { x: 0, y: 0 },
      currentPos: { x: 0, y: 0 },
      originalNodePos: undefined
    });
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConnectionMode({ active: false });
        actions.clearSelection();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't delete nodes if we're currently editing a node's text
        if (selectedNodes.length > 0 && !editingNode) {
          actions.deleteNode(selectedNodes);
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPanMode(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setIsPanMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedNodes, actions, editingNode]);

  // Handle double-click to create nodes
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Convert screen coordinates to world coordinates accounting for transform
    const screenPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    const worldPoint = {
      x: (screenPoint.x - canvasState.panX) / canvasState.zoom,
      y: (screenPoint.y - canvasState.panY) / canvasState.zoom
    };

    // Check if double-clicking on a node to edit
    const clickedNode = currentMindMap?.nodes.find(node => 
      worldPoint.x >= node.x && 
      worldPoint.x <= node.x + node.width &&
      worldPoint.y >= node.y && 
      worldPoint.y <= node.y + node.height
    );

    if (clickedNode) {
      actions.startEditingNode(clickedNode.id);
    } else {
      // Create a new node
      actions.createNode(null, worldPoint, 'New Node');
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
        zoom={1} // Always 1 since scaling is handled by parent container
        onStartConnection={handleStartConnection}
        onNodeMouseDown={handleNodeMouseDown}
      />
    );
  }, [selectedNodes, editingNode, handleStartConnection, handleNodeMouseDown]);

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
        zoom={1} // Always 1 since scaling is handled by parent container
      />
    );
  }, [currentMindMap]);

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
      className={`w-full h-full bg-gray-50 relative overflow-hidden ${
        dragState.isDragging && dragState.dragType === 'canvas' 
          ? 'cursor-grabbing' 
          : dragState.isDragging && dragState.dragType === 'node'
            ? 'cursor-default'
            : 'cursor-grab'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
    >
      {/* Canvas content layer - this gets transformed */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${canvasState.panX}px, ${canvasState.panY}px) scale(${canvasState.zoom})`,
          transformOrigin: 'top left'
        }}
      >
        {/* Grid background */}
        {canvasState.showGrid && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: `${canvasState.gridSize}px ${canvasState.gridSize}px`
            }}
          />
        )}

        {/* Connections */}
        <svg 
          className="absolute inset-0 pointer-events-none"
          style={{
            width: '100%',
            height: '100%'
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
      </div>

      {/* Fixed UI layer - these don't get transformed */}
      {/* Canvas Toolbar */}
      <CanvasToolbar />

      {/* Canvas info overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-gray-600 shadow-lg">
        <div>Zoom: {Math.round(canvasState.zoom * 100)}%</div>
        <div>Nodes: {currentMindMap.nodes.length}</div>
        <div>Connections: {currentMindMap.connections.length}</div>
      </div>

      {/* Help text */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-500 shadow-lg max-w-64">
        <div>• Double-click: Create/Edit node</div>
        <div>• Drag nodes: Move nodes</div>
        <div>• Drag canvas: Navigate canvas</div>
        <div>• Space + Drag: Alternative navigation</div>
        <div>• Middle mouse: Alternative navigation</div>
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

      {/* Minimap */}
      <Minimap />
    </div>
  );
};

export default Canvas;