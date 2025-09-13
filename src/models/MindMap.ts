import mongoose, { Document, Schema } from 'mongoose';

export interface INode {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parentId: string | null;
  children: string[];
  level: number;
  type: 'root' | 'branch' | 'leaf' | 'note' | 'task' | 'link';
  style: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    fontSize: number;
    fontWeight: string;
    shape: 'rectangle' | 'circle' | 'diamond' | 'hexagon';
  };
  collapsed: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: 'straight' | 'curved' | 'stepped';
  style: {
    color: string;
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
    opacity: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ICanvasState {
  zoom: number;
  panX: number;
  panY: number;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  selectedNodes: string[];
  editingNode: string | null;
}

export interface IMindMap extends Document {
  title: string;
  description?: string;
  userId: mongoose.Types.ObjectId;
  isPublic: boolean;
  nodes: INode[];
  connections: IConnection[];
  canvas: ICanvasState;
  version: number;
  tags?: string[];
  collaborators: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const NodeSchema = new Schema<INode>({
  id: { type: String, required: true },
  text: { type: String, required: true, trim: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true, min: 50 },
  height: { type: Number, required: true, min: 30 },
  parentId: { type: String, default: null },
  children: [{ type: String }],
  level: { type: Number, required: true, min: 0 },
  type: {
    type: String,
    enum: ['root', 'branch', 'leaf', 'note', 'task', 'link'],
    default: 'branch',
  },
  style: {
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#1f2937' },
    borderColor: { type: String, default: '#d1d5db' },
    borderWidth: { type: Number, default: 1, min: 0, max: 10 },
    borderRadius: { type: Number, default: 8, min: 0, max: 50 },
    fontSize: { type: Number, default: 14, min: 8, max: 32 },
    fontWeight: { type: String, default: 'normal' },
    shape: {
      type: String,
      enum: ['rectangle', 'circle', 'diamond', 'hexagon'],
      default: 'rectangle',
    },
  },
  collapsed: { type: Boolean, default: false },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, {
  timestamps: true,
});

const ConnectionSchema = new Schema<IConnection>({
  id: { type: String, required: true },
  fromNodeId: { type: String, required: true },
  toNodeId: { type: String, required: true },
  type: {
    type: String,
    enum: ['straight', 'curved', 'stepped'],
    default: 'straight',
  },
  style: {
    color: { type: String, default: '#6b7280' },
    width: { type: Number, default: 2, min: 1, max: 10 },
    style: {
      type: String,
      enum: ['solid', 'dashed', 'dotted'],
      default: 'solid',
    },
    opacity: { type: Number, default: 1, min: 0, max: 1 },
  },
}, {
  timestamps: true,
});

const CanvasStateSchema = new Schema<ICanvasState>({
  zoom: { type: Number, default: 1, min: 0.1, max: 3 },
  panX: { type: Number, default: 0 },
  panY: { type: Number, default: 0 },
  gridSize: { type: Number, default: 20, min: 10, max: 100 },
  showGrid: { type: Boolean, default: false },
  snapToGrid: { type: Boolean, default: false },
  selectedNodes: [{ type: String }],
  editingNode: { type: String, default: null },
});

const MindMapSchema = new Schema<IMindMap>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  nodes: {
    type: [NodeSchema],
    default: [],
  },
  connections: {
    type: [ConnectionSchema],
    default: [],
  },
  canvas: {
    type: CanvasStateSchema,
    default: () => ({
      zoom: 1,
      panX: 0,
      panY: 0,
      gridSize: 20,
      showGrid: false,
      snapToGrid: false,
      selectedNodes: [],
      editingNode: null,
    }),
  },
  version: {
    type: Number,
    default: 1,
    min: 1,
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters'],
  }],
  collaborators: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    default: [],
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
MindMapSchema.index({ userId: 1, createdAt: -1 });
MindMapSchema.index({ isPublic: 1, createdAt: -1 });
MindMapSchema.index({ title: 'text', description: 'text' });
MindMapSchema.index({ tags: 1 });
MindMapSchema.index({ collaborators: 1 });

// Virtual for node count
MindMapSchema.virtual('nodeCount').get(function() {
  return this.nodes ? this.nodes.length : 0;
});

// Virtual for connection count
MindMapSchema.virtual('connectionCount').get(function() {
  return this.connections ? this.connections.length : 0;
});

// Ensure virtual fields are serialized
MindMapSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc: any, ret: any) {
    // Convert ObjectId to string for JSON serialization
    if (ret.userId) {
      ret.userId = ret.userId.toString();
    }
    
    // Ensure collaborators is always an array
    if (!ret.collaborators) {
      ret.collaborators = [];
    } else if (Array.isArray(ret.collaborators)) {
      ret.collaborators = ret.collaborators.map((id: any) => id ? id.toString() : null).filter(Boolean);
    }
    
    // Ensure nodes and connections are arrays
    if (!ret.nodes) ret.nodes = [];
    if (!ret.connections) ret.connections = [];
    
    // Ensure canvas object exists with proper defaults
    if (!ret.canvas) {
      ret.canvas = {
        zoom: 1,
        panX: 0,
        panY: 0,
        gridSize: 20,
        showGrid: false,
        snapToGrid: false,
        selectedNodes: [],
        editingNode: null,
      };
    } else {
      // Ensure canvas has all required properties
      ret.canvas.selectedNodes = ret.canvas.selectedNodes || [];
      ret.canvas.editingNode = ret.canvas.editingNode || null;
    }
    
    return ret;
  },
});

// Pre-save middleware to update version
MindMapSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  next();
});

export const MindMap = mongoose.models.MindMap || mongoose.model<IMindMap>('MindMap', MindMapSchema);