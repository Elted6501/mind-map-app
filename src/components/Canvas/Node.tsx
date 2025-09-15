import React, { useState, useCallback } from 'react';
import { Node as NodeType, NodeType as NodeTypeEnum } from '../../types';
import { useMindMapStore } from '../../store/mindMapStore';

interface NodeProps {
  node: NodeType;
  isSelected: boolean;
  isEditing: boolean;
  zoom: number;
  isDragging?: boolean;
  onStartConnection?: (nodeId: string) => void;
  onNodeMouseDown?: (e: React.MouseEvent, nodeId: string) => void;
  onNodeTouchStart?: (e: React.TouchEvent, nodeId: string) => void;
}

const Node: React.FC<NodeProps> = ({ 
  node, 
  isSelected, 
  isEditing, 
  zoom,
  isDragging = false,
  onStartConnection,
  onNodeMouseDown,
  onNodeTouchStart
}) => {
  const { actions } = useMindMapStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleTextChange = useCallback((text: string) => {
    actions.updateNode(node.id, { text });
  }, [node.id, actions]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      actions.stopEditingNode();
    }
  }, [actions]);

  const handleConnectionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStartConnection) {
      onStartConnection(node.id);
    }
  }, [node.id, onStartConnection]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNodeMouseDown) {
      onNodeMouseDown(e, node.id);
    }
  }, [node.id, onNodeMouseDown]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (onNodeTouchStart) {
      onNodeTouchStart(e, node.id);
    }
  }, [node.id, onNodeTouchStart]);

  const getNodeTypeIcon = () => {
    switch (node.type) {
      case NodeTypeEnum.ROOT:
        return '🌟';
      case NodeTypeEnum.BRANCH:
        return '📁';
      case NodeTypeEnum.LEAF:
        return '📄';
      case NodeTypeEnum.NOTE:
        return '📝';
      case NodeTypeEnum.TASK:
        return '✅';
      case NodeTypeEnum.LINK:
        return '🔗';
      default:
        return '💡';
    }
  };

  const getShapeClass = () => {
    switch (node.style.shape) {
      case 'circle':
        return 'rounded-full';
      default:
        return '';
    }
  };

  const getShapeStyle = () => {
    return {
      left: node.x,
      top: node.y,
      width: node.width,
      height: node.height,
      backgroundColor: node.style.backgroundColor,
      color: node.style.textColor,
      border: `${node.style.borderWidth}px solid ${node.style.borderColor}`,
      borderRadius: node.style.shape === 'circle' ? '50%' : node.style.borderRadius,
      fontSize: node.style.fontSize,
      fontWeight: node.style.fontWeight,
      transform: `scale(${zoom})`,
      transformOrigin: 'top left',
      zIndex: isSelected ? 10 : 1
    };
  };

  return (
    <div
      className={`
        absolute cursor-pointer select-none group
        ${isDragging ? '' : 'transition-all duration-200'}
        ${isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
        ${isHovered ? 'shadow-lg transform scale-105' : 'shadow-md'}
        ${getShapeClass()}
      `}
      style={getShapeStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Node content */}
      <div 
        className="flex items-center justify-center h-full px-2 relative"
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Node type icon */}
        <span className="absolute top-1 left-1 text-xs opacity-70">
          {getNodeTypeIcon()}
        </span>

        {/* Text content */}
        {isEditing ? (
          <input
            type="text"
            value={node.text}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={() => actions.stopEditingNode()}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-transparent border-none outline-none text-center resize-none"
            autoFocus
            style={{ fontSize: 'inherit', color: 'inherit' }}
          />
        ) : (
          <div 
            className="text-center break-words w-full px-1 py-1 flex items-center justify-center"
            style={{
              fontSize: 'inherit',
              lineHeight: '1.2',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              maxHeight: '100%'
            }}
          >
            <span style={{ textAlign: 'center', width: '100%' }}>
              {node.text}
            </span>
          </div>
        )}
      </div>

      {/* Connection handles (visible on hover) */}
      {(isHovered || isSelected) && (
        <>
          {/* Top handle */}
          <div
            className="absolute w-4 h-4 md:w-3 md:h-3 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-pointer hover:bg-blue-600 transition-colors node-handle"
            style={{
              top: -8,
              left: '50%',
              transform: 'translateX(-50%)'
            }}
            onClick={handleConnectionClick}
          />
          
          {/* Right handle */}
          <div
            className="absolute w-4 h-4 md:w-3 md:h-3 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-pointer hover:bg-blue-600 transition-colors node-handle"
            style={{
              right: -8,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
            onClick={handleConnectionClick}
          />
          
          {/* Bottom handle */}
          <div
            className="absolute w-4 h-4 md:w-3 md:h-3 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-pointer hover:bg-blue-600 transition-colors node-handle"
            style={{
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)'
            }}
            onClick={handleConnectionClick}
          />
          
          {/* Left handle */}
          <div
            className="absolute w-4 h-4 md:w-3 md:h-3 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-pointer hover:bg-blue-600 transition-colors node-handle"
            style={{
              left: -8,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
            onClick={handleConnectionClick}
          />
        </>
      )}

      {/* Level indicator */}
      {node.level > 0 && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-600 text-white text-xs rounded-full flex items-center justify-center">
          {node.level}
        </div>
      )}
    </div>
  );
};

export default React.memo(Node);