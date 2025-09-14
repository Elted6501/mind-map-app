import React from 'react';
import { Connection as ConnectionType, Node, ConnectionType as ConnectionTypeEnum } from '../../types';

interface ConnectionProps {
  connection: ConnectionType;
  fromNode: Node;
  toNode: Node;
  isSelected?: boolean;
  zoom: number;
}

const Connection: React.FC<ConnectionProps> = ({ 
  connection, 
  fromNode, 
  toNode, 
  isSelected = false,
  zoom 
}) => {
  // Calculate connection points
  const fromX = fromNode.x + fromNode.width / 2;
  const fromY = fromNode.y + fromNode.height / 2;
  const toX = toNode.x + toNode.width / 2;
  const toY = toNode.y + toNode.height / 2;

  // Calculate control points for curved connections
  const getCurvedPath = () => {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Create a slight curve based on distance
    const curvature = Math.min(distance * 0.2, 50);
    const controlX1 = fromX + dx * 0.3;
    const controlY1 = fromY + dy * 0.3 - curvature;
    const controlX2 = toX - dx * 0.3;
    const controlY2 = toY - dy * 0.3 + curvature;

    return `M ${fromX},${fromY} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${toX},${toY}`;
  };

  const getSteppedPath = () => {
    const midX = (fromX + toX) / 2;
    return `M ${fromX},${fromY} L ${midX},${fromY} L ${midX},${toY} L ${toX},${toY}`;
  };

  const getPath = () => {
    switch (connection.type) {
      case ConnectionTypeEnum.CURVED:
        return getCurvedPath();
      case ConnectionTypeEnum.STEPPED:
        return getSteppedPath();
      default:
        return `M ${fromX},${fromY} L ${toX},${toY}`;
    }
  };

  const getStrokeDashArray = () => {
    switch (connection.style.style) {
      case 'dashed':
        return '8,4';
      case 'dotted':
        return '2,2';
      default:
        return '';
    }
  };

  // Add arrow marker
  const markerId = `arrow-${connection.id}`;

  return (
    <g>
      {/* Arrow marker definition */}
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="3"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={connection.style.color}
            opacity={connection.style.opacity}
          />
        </marker>
      </defs>

      {/* Connection line */}
      <path
        d={getPath()}
        stroke={connection.style.color}
        strokeWidth={connection.style.width * zoom}
        strokeDasharray={getStrokeDashArray()}
        opacity={connection.style.opacity}
        fill="none"
        markerEnd={`url(#${markerId})`}
        className={`
          transition-all duration-200 cursor-pointer
          ${isSelected ? 'stroke-blue-500' : ''}
        `}
        style={{
          filter: isSelected ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))' : 'none'
        }}
      />

      {/* Connection label (if needed) */}
      {connection.type === ConnectionTypeEnum.STEPPED && (
        <text
          x={(fromX + toX) / 2}
          y={(fromY + toY) / 2}
          textAnchor="middle"
          dy="-5"
          fontSize={10 * zoom}
          fill={connection.style.color}
          opacity={0.7}
          className="pointer-events-none select-none"
        >
          {/* Optional: Add connection labels here */}
        </text>
      )}
    </g>
  );
};

export default Connection;