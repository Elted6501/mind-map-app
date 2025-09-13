import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MindMapStore {
  // UI state
  sidebarOpen: boolean;
  propertyPanelOpen: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  toggleSidebar: () => void;
  togglePropertyPanel: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

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
import { localStorageService } from '../services/localStorageService';
import { AuthService } from '../services/authService';

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

const MAX_HISTORY_SIZE = 50;

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
            // Get current user ID
            let userId = 'anonymous';
            try {
              const user = await AuthService.getProfile();
              userId = user.id;
            } catch {
              // User not authenticated, use anonymous
            }
            
            const newMindMap: MindMap = {
              id: crypto.randomUUID(),
              title,
              description: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              userId,
              isPublic: false,
              nodes: [],
              connections: [],
              canvas: { ...DEFAULT_CANVAS_STATE },
              version: 1,
              tags: [],
              collaborators: [],
            };

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

            newMindMap.nodes = [rootNode];
            
            // Ensure canvas exists before setting selectedNodes
            if (!newMindMap.canvas) {
              newMindMap.canvas = { ...DEFAULT_CANVAS_STATE };
            }
            newMindMap.canvas.selectedNodes = [rootNode.id];

            // Save to backend (only send the required fields)
            const savedMindMap = await MindMapService.createMindMap({
              title: newMindMap.title,
              description: newMindMap.description,
              isPublic: newMindMap.isPublic
            });

            set((state) => ({
              currentMindMap: savedMindMap,
              mindMaps: [...state.mindMaps, savedMindMap],
              selectedNodes: [rootNode.id],
              history: [{ mindMap: savedMindMap, timestamp: new Date(), action: 'create' }],
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
          set((state) => {
            if (!state.currentMindMap) return state;

            const newNode: Node = {
              id: crypto.randomUUID(),
              text,
              x: position.x,
              y: position.y,
              width: 150,
              height: 50,
              parentId,
              children: [],
              level: parentId ? (state.currentMindMap.nodes.find(n => n.id === parentId)?.level || 0) + 1 : 0,
              type: parentId ? NodeType.CHILD : NodeType.ROOT,
              style: { ...DEFAULT_NODE_STYLE },
              collapsed: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            const updatedNodes = [...state.currentMindMap.nodes, newNode];
            
            // Update parent's children array if parentId exists
            if (parentId) {
              const parentIndex = updatedNodes.findIndex(n => n.id === parentId);
              if (parentIndex !== -1) {
                updatedNodes[parentIndex] = {
                  ...updatedNodes[parentIndex],
                  children: [...updatedNodes[parentIndex].children, newNode.id],
                  updatedAt: new Date()
                };
              }
            }

            const updatedMindMap = {
              ...state.currentMindMap,
              nodes: updatedNodes,
              updatedAt: new Date()
            };

            return {
              currentMindMap: updatedMindMap,
              selectedNodes: [newNode.id],
              editingNode: newNode.id
            };
          });
        },

        updateNode: (nodeId: string, updates: Partial<Node>) => {
          set((state) => {
            if (!state.currentMindMap) return state;

            const updatedNodes = state.currentMindMap.nodes.map(node =>
              node.id === nodeId
                ? { ...node, ...updates, updatedAt: new Date() }
                : node
            );

            const updatedMindMap = {
              ...state.currentMindMap,
              nodes: updatedNodes,
              updatedAt: new Date()
            };

            return {
              currentMindMap: updatedMindMap
            };
          });
        },

        deleteNode: (nodeIds: string[]) => {
          set((state) => {
            if (!state.currentMindMap) return state;

            // Get all nodes to delete (including children)
            const getAllChildrenIds = (nodeId: string): string[] => {
              const node = state.currentMindMap!.nodes.find(n => n.id === nodeId);
              if (!node) return [nodeId];
              
              const childIds: string[] = [];
              for (const childId of node.children) {
                childIds.push(...getAllChildrenIds(childId));
              }
              return [nodeId, ...childIds];
            };

            const allNodesToDelete = new Set(nodeIds.flatMap(getAllChildrenIds));
            
            // Remove nodes
            const updatedNodes = state.currentMindMap.nodes.filter(node => !allNodesToDelete.has(node.id));
            
            // Remove connections involving deleted nodes
            const updatedConnections = state.currentMindMap.connections.filter(conn =>
              !allNodesToDelete.has(conn.fromNodeId) && !allNodesToDelete.has(conn.toNodeId)
            );

            // Update parent nodes to remove deleted children
            const finalNodes = updatedNodes.map(node => ({
              ...node,
              children: node.children.filter(childId => !allNodesToDelete.has(childId))
            }));

            const updatedMindMap = {
              ...state.currentMindMap,
              nodes: finalNodes,
              connections: updatedConnections,
              updatedAt: new Date()
            };

            return {
              currentMindMap: updatedMindMap,
              selectedNodes: state.selectedNodes.filter(id => !allNodesToDelete.has(id)),
              editingNode: allNodesToDelete.has(state.editingNode || '') ? null : state.editingNode
            };
          });
        },

        moveNodes: (movements: NodeMovement[]) => {
          set((state) => {
            if (!state.currentMindMap) return state;

            const updatedNodes = state.currentMindMap.nodes.map(node => {
              const movement = movements.find(m => m.nodeId === node.id);
              return movement
                ? { ...node, x: movement.x, y: movement.y, updatedAt: new Date() }
                : node;
            });

            const updatedMindMap = {
              ...state.currentMindMap,
              nodes: updatedNodes,
              updatedAt: new Date()
            };

            return {
              currentMindMap: updatedMindMap
            };
          });
        },

        duplicateNode: (nodeId: string) => {
          set((state) => {
            if (!state.currentMindMap) return state;

            const originalNode = state.currentMindMap.nodes.find(n => n.id === nodeId);
            if (!originalNode) return state;

            const newNode: Node = {
              ...originalNode,
              id: crypto.randomUUID(),
              text: `${originalNode.text} (Copy)`,
              x: originalNode.x + 20,
              y: originalNode.y + 20,
              children: [], // Don't duplicate children for now
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const updatedMindMap = {
              ...state.currentMindMap,
              nodes: [...state.currentMindMap.nodes, newNode],
              updatedAt: new Date()
            };

            return {
              currentMindMap: updatedMindMap,
              selectedNodes: [newNode.id]
            };
          });
        },

        // Connection operations
        createConnection: (fromNodeId: string, toNodeId: string) => {
          set((state) => {
            if (!state.currentMindMap) return state;

            // Check if connection already exists
            const existingConnection = state.currentMindMap.connections.find(
              conn => conn.fromNodeId === fromNodeId && conn.toNodeId === toNodeId
            );
            
            if (existingConnection) return state;

            const newConnection: Connection = {
              id: crypto.randomUUID(),
              fromNodeId,
              toNodeId,
              type: ConnectionType.CURVE,
              style: {
                color: '#666',
                strokeWidth: 2,
                strokeDasharray: ''
              },
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const updatedMindMap = {
              ...state.currentMindMap,
              connections: [...state.currentMindMap.connections, newConnection],
              updatedAt: new Date()
            };

            return {
              currentMindMap: updatedMindMap
            };
          });
        },

        deleteConnection: (connectionId: string) => {
          set((state) => {
            if (!state.currentMindMap) return state;

            const updatedMindMap = {
              ...state.currentMindMap,
              connections: state.currentMindMap.connections.filter(conn => conn.id !== connectionId),
              updatedAt: new Date()
            };

            return {
              currentMindMap: updatedMindMap
            };
          });
        },

        updateConnection: (connectionId: string, updates: Partial<Connection>) => {
          set((state) => {
            if (!state.currentMindMap) return state;

            const updatedConnections = state.currentMindMap.connections.map(conn =>
              conn.id === connectionId
                ? { ...conn, ...updates, updatedAt: new Date() }
                : conn
            );

            const updatedMindMap = {
              ...state.currentMindMap,
              connections: updatedConnections,
              updatedAt: new Date()
            };

            return {
              currentMindMap: updatedMindMap
            };
          });
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

        // History
        saveSnapshot: (action: string) => {
          set((state) => {
            if (!state.currentMindMap) return state;

            const snapshot: MindMapSnapshot = {
              mindMap: JSON.parse(JSON.stringify(state.currentMindMap)),
              timestamp: new Date(),
              action
            };

            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push(snapshot);

            // Limit history size
            if (newHistory.length > MAX_HISTORY_SIZE) {
              newHistory.shift();
            }

            return {
              history: newHistory,
              historyIndex: newHistory.length - 1
            };
          });
        },

        undo: () => {
          set((state) => {
            if (state.historyIndex <= 0) return state;

            const previousSnapshot = state.history[state.historyIndex - 1];
            return {
              currentMindMap: JSON.parse(JSON.stringify(previousSnapshot.mindMap)),
              historyIndex: state.historyIndex - 1,
              selectedNodes: [],
              editingNode: null
            };
          });
        },

        redo: () => {
          set((state) => {
            if (state.historyIndex >= state.history.length - 1) return state;

            const nextSnapshot = state.history[state.historyIndex + 1];
            return {
              currentMindMap: JSON.parse(JSON.stringify(nextSnapshot.mindMap)),
              historyIndex: state.historyIndex + 1,
              selectedNodes: [],
              editingNode: null
            };
          });
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