// Core data types for the Mind Map application

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum NodeType {
  ROOT = 'root',
  BRANCH = 'branch',
  LEAF = 'leaf',
  NOTE = 'note',
  TASK = 'task',
  LINK = 'link'
}

export enum ConnectionType {
  STRAIGHT = 'straight',
  CURVED = 'curved',
  STEPPED = 'stepped'
}

export enum ExportFormat {
  PNG = 'png',
  JPG = 'jpg',
  PDF = 'pdf',
  SVG = 'svg',
  JSON = 'json',
  XML = 'xml'
}

export enum ImportFormat {
  JSON = 'json',
  XML = 'xml',
  FREEMIND = 'freemind',
  XMIND = 'xmind',
  COGGLE = 'coggle'
}

export interface NodeStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  fontSize: number;
  fontWeight: string;
  shape: 'rectangle' | 'circle' | 'diamond' | 'hexagon';
}

export interface ConnectionStyle {
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  opacity: number;
}

export interface NodeMetadata {
  attachments?: string[];
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  [key: string]: unknown;
}

export interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parentId: string | null;
  children: string[];
  level: number; // hierarchy depth
  type: NodeType;
  style: NodeStyle;
  collapsed: boolean;
  metadata?: NodeMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: ConnectionType;
  style: ConnectionStyle;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  selectedNodes: string[];
  editingNode: string | null;
}

export interface MindMap {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isPublic: boolean;
  nodes: Node[];
  connections: Connection[];
  canvas: CanvasState;
  version: number; // for undo/redo
  tags?: string[];
  collaborators?: string[];
}

export interface MindMapSummary {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  nodeCount: number;
  isPublic: boolean;
  tags?: string[];
}

export interface NodeMovement {
  nodeId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface MindMapSnapshot {
  mindMap: MindMap;
  timestamp: Date;
  action: string;
}

export interface SearchResult {
  nodeId: string;
  mindMapId: string;
  text: string;
  context: string;
  relevance: number;
}

export interface NodeFilter {
  type?: NodeType;
  level?: number;
  hasChildren?: boolean;
  text?: string;
  style?: Partial<NodeStyle>;
}

export interface ExportOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  includeGrid?: boolean;
  quality?: number;
}

export interface CollaborationOperationData {
  position?: Point;
  text?: string;
  style?: Partial<NodeStyle>;
  connections?: string[];
  [key: string]: unknown;
}

export interface CollaborationOperation {
  type: 'create' | 'update' | 'delete' | 'move' | 'connect' | 'disconnect';
  nodeId?: string;
  connectionId?: string;
  data?: CollaborationOperationData;
  timestamp: Date;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MindMapTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: Omit<Node, 'id' | 'createdAt' | 'updatedAt'>[];
  connections: Omit<Connection, 'id' | 'createdAt' | 'updatedAt'>[];
  isPublic: boolean;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CollaborationEventData {
  operation?: CollaborationOperation;
  position?: Point;
  selectedNodes?: string[];
  [key: string]: unknown;
}

// Event types for real-time collaboration
export interface CollaborationEvent {
  type: 'user_joined' | 'user_left' | 'operation' | 'cursor_move' | 'selection_change';
  userId: string;
  data?: CollaborationEventData;
  timestamp: Date;
}

// Local storage keys
export const STORAGE_KEYS = {
  MIND_MAPS: 'mind_maps',
  CURRENT_MIND_MAP: 'current_mind_map',
  USER_PREFERENCES: 'user_preferences',
  RECENT_MIND_MAPS: 'recent_mind_maps',
} as const;

// Default values
export const DEFAULT_NODE_STYLE: NodeStyle = {
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderColor: '#d1d5db',
  borderWidth: 1,
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 'normal',
  shape: 'rectangle',
};

export const DEFAULT_CONNECTION_STYLE: ConnectionStyle = {
  color: '#6b7280',
  width: 2,
  style: 'solid',
  opacity: 1,
};

export const DEFAULT_CANVAS_STATE: CanvasState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  gridSize: 20,
  showGrid: false,
  snapToGrid: false,
  selectedNodes: [],
  editingNode: null,
};

export const NODE_TYPE_CONFIGS: Record<NodeType, Partial<NodeStyle>> = {
  [NodeType.ROOT]: {
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    borderColor: '#1d4ed8',
    borderWidth: 2,
    fontSize: 16,
    fontWeight: 'bold',
  },
  [NodeType.BRANCH]: {
    backgroundColor: '#f3f4f6',
    textColor: '#374151',
    borderColor: '#9ca3af',
    borderWidth: 1,
    fontSize: 14,
    fontWeight: 'medium',
  },
  [NodeType.LEAF]: {
    backgroundColor: '#ffffff',
    textColor: '#6b7280',
    borderColor: '#d1d5db',
    borderWidth: 1,
    fontSize: 12,
    fontWeight: 'normal',
  },
  [NodeType.NOTE]: {
    backgroundColor: '#fef3c7',
    textColor: '#92400e',
    borderColor: '#f59e0b',
    borderWidth: 1,
    fontSize: 12,
    fontWeight: 'normal',
  },
  [NodeType.TASK]: {
    backgroundColor: '#d1fae5',
    textColor: '#065f46',
    borderColor: '#10b981',
    borderWidth: 1,
    fontSize: 12,
    fontWeight: 'normal',
  },
  [NodeType.LINK]: {
    backgroundColor: '#e0e7ff',
    textColor: '#3730a3',
    borderColor: '#6366f1',
    borderWidth: 1,
    fontSize: 12,
    fontWeight: 'normal',
  },
};