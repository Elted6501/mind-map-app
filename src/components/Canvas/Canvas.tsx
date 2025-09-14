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
  initialNodePos?: Point;  // Node's initial position when drag started
  currentNodePos?: Point;  // Current position during drag (for live preview)
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

    // Simple canvas coordinates
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
    
    const currentNode = currentMindMap?.nodes.find(n => n.id === nodeId);
    if (currentNode) {
      setDragState({
        isDragging: true,
        dragType: 'node',
        startPos: point,
        currentPos: point,
        draggedNodeId: nodeId,
        initialNodePos: { x: currentNode.x, y: currentNode.y }
      });
    }
  }, [connectionMode, selectedNodes, actions, handleFinishConnection, currentMindMap]);

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

      // Node dragging is handled by handleNodeMouseDown, so just return here
      return;
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

    if (dragState.dragType === 'node' && dragState.draggedNodeId && dragState.initialNodePos) {
      // Convert current mouse position to world coordinates
      const currentWorldX = (screenPoint.x - canvasState.panX) / canvasState.zoom;
      const currentWorldY = (screenPoint.y - canvasState.panY) / canvasState.zoom;
      
      // Convert start mouse position to world coordinates
      const startWorldX = (dragState.startPos.x - canvasState.panX) / canvasState.zoom;
      const startWorldY = (dragState.startPos.y - canvasState.panY) / canvasState.zoom;
      
      // Calculate world delta
      const worldDeltaX = currentWorldX - startWorldX;
      const worldDeltaY = currentWorldY - startWorldY;
      
      // Calculate new position for live preview
      const newPosition = {
        x: dragState.initialNodePos.x + worldDeltaX,
        y: dragState.initialNodePos.y + worldDeltaY
      };
      
      // Store current position in drag state for live preview (don't update store yet)
      setDragState(prev => ({
        ...prev,
        currentNodePos: newPosition
      }));
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
    // If we were dragging a node, commit the final position to the store
    if (dragState.dragType === 'node' && dragState.draggedNodeId && dragState.currentNodePos) {
      actions.updateNode(dragState.draggedNodeId, {
        x: dragState.currentNodePos.x,
        y: dragState.currentNodePos.y
      });
    }
    
    // Reset drag state
    setDragState({
      isDragging: false,
      dragType: null,
      startPos: { x: 0, y: 0 },
      currentPos: { x: 0, y: 0 }
    });
  }, [dragState, actions]);

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
    const isNodeBeingDragged = dragState.dragType === 'node' && dragState.draggedNodeId === node.id;
    
    // Use current drag position if this node is being dragged
    const nodeToRender = (isNodeBeingDragged && dragState.currentNodePos) 
      ? { ...node, x: dragState.currentNodePos.x, y: dragState.currentNodePos.y }
      : node;

    return (
      <NodeComponent
        key={node.id}
        node={nodeToRender}
        isSelected={isSelected}
        isEditing={isEditing}
        isDragging={isNodeBeingDragged}
        zoom={1} // Always 1 since scaling is handled by parent container
        onStartConnection={handleStartConnection}
        onNodeMouseDown={handleNodeMouseDown}
      />
    );
  }, [selectedNodes, editingNode, handleStartConnection, handleNodeMouseDown, dragState]);

  // Render a connection
  const renderConnection = useCallback((connection: Connection) => {
    const fromNode = currentMindMap?.nodes.find(n => n.id === connection.fromNodeId);
    const toNode = currentMindMap?.nodes.find(n => n.id === connection.toNodeId);
    
    if (!fromNode || !toNode) return null;

    // Check if either node is being dragged and use live position if so
    const isFromNodeBeingDragged = dragState.dragType === 'node' && dragState.draggedNodeId === connection.fromNodeId;
    const isToNodeBeingDragged = dragState.dragType === 'node' && dragState.draggedNodeId === connection.toNodeId;
    const isConnectionBeingDragged = isFromNodeBeingDragged || isToNodeBeingDragged;
    
    const fromNodeToRender = (isFromNodeBeingDragged && dragState.currentNodePos) 
      ? { ...fromNode, x: dragState.currentNodePos.x, y: dragState.currentNodePos.y }
      : fromNode;
      
    const toNodeToRender = (isToNodeBeingDragged && dragState.currentNodePos) 
      ? { ...toNode, x: dragState.currentNodePos.x, y: dragState.currentNodePos.y }
      : toNode;

    return (
      <ConnectionComponent
        key={connection.id}
        connection={connection}
        fromNode={fromNodeToRender}
        toNode={toNodeToRender}
        isDragging={isConnectionBeingDragged}
        zoom={1} // Always 1 since scaling is handled by parent container
      />
    );
  }, [currentMindMap, dragState]);

  if (!currentMindMap) {
    return (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">🧠</div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Mind Mapping App Loaded</h2>
            <p className="text-gray-600 mb-2">Create or load a mind mapping app to get started</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={canvasRef}
      className={`w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden ${
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
      style={{ touchAction: 'none' }} // Prevent default touch behaviors for better control
    >
      {/* Connections layer - positioned over entire viewport but behind nodes */}
      <svg 
        className="absolute inset-0 pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible'
        }}
      >
        {/* Transform group for connections to match canvas transform */}
        <g transform={`translate(${canvasState.panX}, ${canvasState.panY}) scale(${canvasState.zoom})`}>
          {currentMindMap.connections.map(renderConnection)}
          
          {/* Connection preview line */}
          {connectionMode.active && connectionMode.startNodeId && connectionMode.currentPos && (
            (() => {
              const startNode = currentMindMap.nodes.find(n => n.id === connectionMode.startNodeId);
              if (!startNode) return null;
              
              // Use live drag position if start node is being dragged
              const isStartNodeBeingDragged = dragState.dragType === 'node' && dragState.draggedNodeId === connectionMode.startNodeId;
              const startNodeToRender = (isStartNodeBeingDragged && dragState.currentNodePos) 
                ? { ...startNode, x: dragState.currentNodePos.x, y: dragState.currentNodePos.y }
                : startNode;
              
              const startX = startNodeToRender.x + startNodeToRender.width / 2;
              const startY = startNodeToRender.y + startNodeToRender.height / 2;
              
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
        </g>
      </svg>

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

        {/* Nodes */}
        <div className="relative">
          {currentMindMap.nodes.map(renderNode)}
        </div>
      </div>

      {/* Fixed UI layer - these don't get transformed */}
      {/* Canvas Toolbar */}
      <CanvasToolbar />

      {/* Canvas info overlay */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-gray-600 shadow-lg">
        <div>Zoom: {Math.round(canvasState.zoom * 100)}%</div>
        <div className="hidden sm:block">Nodes: {currentMindMap.nodes.length}</div>
        <div className="hidden sm:block">Connections: {currentMindMap.connections.length}</div>
      </div>

      {/* Help text - Hidden on mobile, shown on larger screens */}
      <div className="hidden lg:block absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-500 shadow-lg max-w-64">
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

      {/* Mobile help indicator */}
      <div className="lg:hidden absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-gray-500 shadow-lg">
        {connectionMode.active ? (
          <div className="text-blue-600 font-medium">🔗 Tap node to connect</div>
        ) : (
          <div>Double-tap to create node</div>
        )}
      </div>

      {/* Minimap */}
      <Minimap />
    </div>
  );
};

export default Canvas;