import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { 
  MindMap, 
  Node, 
  Connection, 
  CanvasState, 
  MindMapSnapshot, 
  NodeMovement, 
  Point,
  DEFAULT_CANVAS_STATE,
  DEFAULT_NODE_STYLE,
  NodeType,
  ConnectionType
} from '../types';
import { MindMapService } from '../services/mindMapService';

interface MindMapStore {
  // Current state
  currentMindMap: MindMap | null;
  mindMaps: MindMap[];
  selectedNodes: string[];
  editingNode: string | null;
  canvasState: CanvasState;
  
  // History for undo/redo
  history: MindMapSnapshot[];
  historyIndex: number;
  
  // UI state
  sidebarOpen: boolean;
  propertyPanelOpen: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  actions: {
    // Mind map operations
    loadAllMindMaps: () => Promise<void>;
    createMindMap: (title: string) => Promise<void>;
    loadMindMap: (id: string) => Promise<void>;
    saveMindMap: () => Promise<void>;
    deleteMindMap: (id: string) => Promise<void>;
    updateMindMap: (updates: Partial<MindMap>) => void;
    
    // Node operations
    createNode: (parentId: string | null, position: Point, text?: string) => void;
    updateNode: (nodeId: string, updates: Partial<Node>) => void;
    deleteNode: (nodeIds: string[]) => void;
    moveNodes: (movements: NodeMovement[]) => void;
    duplicateNode: (nodeId: string) => void;
    
    // Connection operations
    createConnection: (fromNodeId: string, toNodeId: string) => void;
    deleteConnection: (connectionId: string) => void;
    updateConnection: (connectionId: string, updates: Partial<Connection>) => void;
    
    // Selection
    selectNodes: (nodeIds: string[]) => void;
    clearSelection: () => void;
    toggleNodeSelection: (nodeId: string) => void;
    
    // Editing
    startEditingNode: (nodeId: string) => void;
    stopEditingNode: () => void;
    
    // History
    undo: () => void;
    redo: () => void;
    saveSnapshot: (action: string) => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    
    // Canvas
    updateCanvas: (updates: Partial<CanvasState>) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    panTo: (x: number, y: number) => void;
    
    // UI
    toggleSidebar: () => void;
    togglePropertyPanel: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
  };
}

export const useMindMapStore = create<MindMapStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      currentMindMap: null,
      mindMaps: [],
      selectedNodes: [],
      editingNode: null,
      canvasState: DEFAULT_CANVAS_STATE,
      history: [],
      historyIndex: -1,
      sidebarOpen: true,
      propertyPanelOpen: false,
      loading: false,
      error: null,

      actions: {
        // Mind map operations
        loadAllMindMaps: async () => {
          // Check if user is authenticated before making API calls
          const { AuthService } = await import('@/services/authService');
          if (!AuthService.isAuthenticated()) {
            console.log('Cannot load mind maps - user not authenticated');
            set({ 
              loading: false, 
              error: 'Authentication required' 
            });
            return;
          }

          set({ loading: true, error: null });
          
          try {
            const mindMaps = await MindMapService.getAllMindMaps();
            set({ 
              mindMaps, 
              loading: false 
            });
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : 'Failed to load mind maps' 
            });
            throw error;
          }
        },

        createMindMap: async (title: string) => {
          set({ loading: true, error: null });
          
          try {
            // Create root node
            const rootNode: Node = {
              id: crypto.randomUUID(),
              text: title,
              x: 400,
              y: 300,
              width: 200,
              height: 60,
              parentId: null,
              children: [],
              level: 0,
              type: NodeType.ROOT,
              style: { ...DEFAULT_NODE_STYLE },
              collapsed: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Save to backend
            const savedMindMap = await MindMapService.createMindMap({
              title,
              description: '',
              isPublic: false
            });

            // Add the root node to the saved mind map
            const mindMapWithNodes = {
              ...savedMindMap,
              nodes: [rootNode],
              connections: [],
              canvas: { ...DEFAULT_CANVAS_STATE, selectedNodes: [rootNode.id] }
            };

            set((state) => ({
              currentMindMap: mindMapWithNodes,
              mindMaps: [...state.mindMaps, mindMapWithNodes],
              selectedNodes: [rootNode.id],
              history: [{ mindMap: mindMapWithNodes, timestamp: new Date(), action: 'create' }],
              historyIndex: 0,
              loading: false,
            }));
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : 'Failed to create mind map' 
            });
            throw error;
          }
        },

        loadMindMap: async (id: string) => {
          set({ loading: true, error: null });
          
          try {
            const mindMap = await MindMapService.getMindMap(id);
            set({ 
              currentMindMap: mindMap,
              selectedNodes: [],
              editingNode: null,
              canvasState: mindMap.canvas || DEFAULT_CANVAS_STATE,
              history: [{ mindMap, timestamp: new Date(), action: 'load' }],
              historyIndex: 0,
              loading: false 
            });
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : 'Failed to load mind map' 
            });
            throw error;
          }
        },

        saveMindMap: async () => {
          const { currentMindMap } = get();
          if (!currentMindMap) return;

          set({ loading: true, error: null });
          
          try {
            const updatedMindMap = await MindMapService.updateMindMap(currentMindMap.id, currentMindMap);
            set((state) => ({
              currentMindMap: updatedMindMap,
              mindMaps: state.mindMaps.map(m => m.id === updatedMindMap.id ? updatedMindMap : m),
              loading: false
            }));
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : 'Failed to save mind map' 
            });
            throw error;
          }
        },

        deleteMindMap: async (id: string) => {
          set({ loading: true, error: null });
          
          try {
            await MindMapService.deleteMindMap(id);
            set((state) => ({
              mindMaps: state.mindMaps.filter(m => m.id !== id),
              currentMindMap: state.currentMindMap?.id === id ? null : state.currentMindMap,
              loading: false
            }));
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : 'Failed to delete mind map' 
            });
            throw error;
          }
        },

        updateMindMap: (updates: Partial<MindMap>) => {
          set((state) => {
            if (!state.currentMindMap) return state;
            
            const updatedMindMap = {
              ...state.currentMindMap,
              ...updates,
              updatedAt: new Date()
            };
            
            return {
              currentMindMap: updatedMindMap,
              mindMaps: state.mindMaps.map(m => m.id === updatedMindMap.id ? updatedMindMap : m)
            };
          });
        },

        // Node operations
        createNode: (parentId: string | null, position: Point, text = 'New Node') => {
          const state = get();
          if (!state.currentMindMap) return;

          const newNode: Node = {
            id: crypto.randomUUID(),
            text,
            x: position.x,
            y: position.y,
            width: 150,
            height: 60,
            parentId,
            children: [],
            level: parentId ? (state.currentMindMap.nodes.find(n => n.id === parentId)?.level || 0) + 1 : 0,
            type: parentId ? NodeType.BRANCH : NodeType.ROOT,
            style: { ...DEFAULT_NODE_STYLE },
            collapsed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set(state => ({
            currentMindMap: state.currentMindMap ? {
              ...state.currentMindMap,
              nodes: [...state.currentMindMap.nodes, newNode],
              updatedAt: new Date(),
            } : null
          }));

          // Update parent's children array
          if (parentId) {
            state.actions.updateNode(parentId, {
              children: [...(state.currentMindMap?.nodes.find(n => n.id === parentId)?.children || []), newNode.id]
            });
          }
        },

        updateNode: (nodeId: string, updates: Partial<Node>) => {
          set(state => ({
            currentMindMap: state.currentMindMap ? {
              ...state.currentMindMap,
              nodes: state.currentMindMap.nodes.map(node =>
                node.id === nodeId
                  ? { ...node, ...updates, updatedAt: new Date() }
                  : node
              ),
              updatedAt: new Date(),
            } : null
          }));
        },

        deleteNode: (nodeIds: string[]) => {
          const state = get();
          if (!state.currentMindMap) return;

          set(state => ({
            currentMindMap: state.currentMindMap ? {
              ...state.currentMindMap,
              nodes: state.currentMindMap.nodes.filter(node => !nodeIds.includes(node.id)),
              connections: state.currentMindMap.connections.filter(
                conn => !nodeIds.includes(conn.fromNodeId) && !nodeIds.includes(conn.toNodeId)
              ),
              updatedAt: new Date(),
            } : null,
            selectedNodes: []
          }));
        },

        moveNodes: (movements: NodeMovement[]) => {
          set(state => ({
            currentMindMap: state.currentMindMap ? {
              ...state.currentMindMap,
              nodes: state.currentMindMap.nodes.map(node => {
                const movement = movements.find(m => m.nodeId === node.id);
                return movement
                  ? { ...node, x: movement.toX, y: movement.toY, updatedAt: new Date() }
                  : node;
              }),
              updatedAt: new Date(),
            } : null
          }));
        },

        duplicateNode: (nodeId: string) => {
          const state = get();
          if (!state.currentMindMap) return;

          const originalNode = state.currentMindMap.nodes.find(n => n.id === nodeId);
          if (!originalNode) return;

          const newNode: Node = {
            ...originalNode,
            id: crypto.randomUUID(),
            text: `${originalNode.text} (Copy)`,
            x: originalNode.x + 20,
            y: originalNode.y + 20,
            children: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set(state => ({
            currentMindMap: state.currentMindMap ? {
              ...state.currentMindMap,
              nodes: [...state.currentMindMap.nodes, newNode],
              updatedAt: new Date(),
            } : null
          }));
        },

        // Connection operations
        createConnection: (fromNodeId: string, toNodeId: string) => {
          const state = get();
          if (!state.currentMindMap) return;

          // Check if connection already exists
          const exists = state.currentMindMap.connections.some(
            conn => (conn.fromNodeId === fromNodeId && conn.toNodeId === toNodeId) ||
                   (conn.fromNodeId === toNodeId && conn.toNodeId === fromNodeId)
          );

          if (exists) return;

          const newConnection: Connection = {
            id: crypto.randomUUID(),
            fromNodeId,
            toNodeId,
            type: ConnectionType.STRAIGHT,
            style: {
              color: '#6b7280',
              width: 2,
              style: 'solid',
              opacity: 1,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set(state => ({
            currentMindMap: state.currentMindMap ? {
              ...state.currentMindMap,
              connections: [...state.currentMindMap.connections, newConnection],
              updatedAt: new Date(),
            } : null
          }));
        },

        deleteConnection: (connectionId: string) => {
          set(state => ({
            currentMindMap: state.currentMindMap ? {
              ...state.currentMindMap,
              connections: state.currentMindMap.connections.filter(conn => conn.id !== connectionId),
              updatedAt: new Date(),
            } : null
          }));
        },

        updateConnection: (connectionId: string, updates: Partial<Connection>) => {
          set(state => ({
            currentMindMap: state.currentMindMap ? {
              ...state.currentMindMap,
              connections: state.currentMindMap.connections.map(conn =>
                conn.id === connectionId
                  ? { ...conn, ...updates, updatedAt: new Date() }
                  : conn
              ),
              updatedAt: new Date(),
            } : null
          }));
        },

        // Selection
        selectNodes: (nodeIds: string[]) => {
          set({ selectedNodes: nodeIds });
        },

        clearSelection: () => {
          set({ selectedNodes: [] });
        },

        toggleNodeSelection: (nodeId: string) => {
          set((state) => ({
            selectedNodes: state.selectedNodes.includes(nodeId)
              ? state.selectedNodes.filter(id => id !== nodeId)
              : [...state.selectedNodes, nodeId]
          }));
        },

        // Editing
        startEditingNode: (nodeId: string) => {
          set({ editingNode: nodeId });
        },

        stopEditingNode: () => {
          set({ editingNode: null });
        },

        // History - simplified for now
        saveSnapshot: () => {
          // TODO: Implement history snapshots when needed
        },

        undo: () => {
          // TODO: Implement undo
        },

        redo: () => {
          // TODO: Implement redo
        },

        canUndo: () => {
          const { historyIndex } = get();
          return historyIndex > 0;
        },

        canRedo: () => {
          const { historyIndex, history } = get();
          return historyIndex < history.length - 1;
        },

        // Canvas
        updateCanvas: (updates: Partial<CanvasState>) => {
          set((state) => ({
            canvasState: { ...state.canvasState, ...updates }
          }));
        },

        zoomIn: () => {
          set((state) => ({
            canvasState: {
              ...state.canvasState,
              zoom: Math.min(state.canvasState.zoom * 1.2, 3)
            }
          }));
        },

        zoomOut: () => {
          set((state) => ({
            canvasState: {
              ...state.canvasState,
              zoom: Math.max(state.canvasState.zoom / 1.2, 0.1)
            }
          }));
        },

        resetZoom: () => {
          set((state) => ({
            canvasState: {
              ...state.canvasState,
              zoom: 1
            }
          }));
        },

        panTo: (x: number, y: number) => {
          set((state) => ({
            canvasState: {
              ...state.canvasState,
              panX: x,
              panY: y
            }
          }));
        },

        // UI
        toggleSidebar: () => {
          set((state) => ({ sidebarOpen: !state.sidebarOpen }));
        },

        togglePropertyPanel: () => {
          set((state) => ({ propertyPanelOpen: !state.propertyPanelOpen }));
        },

        setLoading: (loading: boolean) => {
          set({ loading });
        },

        setError: (error: string | null) => {
          set({ error });
        }
      }
    }))
  )
);