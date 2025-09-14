// Utility functions to ensure mind map data integrity

import { MindMap, DEFAULT_CANVAS_STATE } from '../types';

// Ensure mind map has all required properties with proper defaults
export const sanitizeMindMap = (mindMap: unknown): MindMap => {
  if (!mindMap || typeof mindMap !== 'object') {
    throw new Error('Invalid mind map data');
  }

  const mindMapObj = mindMap as Record<string, unknown>;

  return {
    id: typeof mindMapObj.id === 'string' ? mindMapObj.id : '',
    title: typeof mindMapObj.title === 'string' ? mindMapObj.title : 'Untitled',
    description: typeof mindMapObj.description === 'string' ? mindMapObj.description : '',
    createdAt: mindMapObj.createdAt ? new Date(mindMapObj.createdAt as string) : new Date(),
    updatedAt: mindMapObj.updatedAt ? new Date(mindMapObj.updatedAt as string) : new Date(),
    userId: typeof mindMapObj.userId === 'string' ? mindMapObj.userId : 'unknown',
    isPublic: Boolean(mindMapObj.isPublic),
    nodes: Array.isArray(mindMapObj.nodes) ? mindMapObj.nodes : [],
    connections: Array.isArray(mindMapObj.connections) ? mindMapObj.connections : [],
    canvas: mindMapObj.canvas && typeof mindMapObj.canvas === 'object' 
      ? {
          ...DEFAULT_CANVAS_STATE,
          ...(mindMapObj.canvas as Record<string, unknown>),
          selectedNodes: Array.isArray((mindMapObj.canvas as Record<string, unknown>).selectedNodes) 
            ? (mindMapObj.canvas as Record<string, unknown>).selectedNodes as string[]
            : [],
          editingNode: (mindMapObj.canvas as Record<string, unknown>).editingNode as string | null || null,
        }
      : { ...DEFAULT_CANVAS_STATE },
    version: typeof mindMapObj.version === 'number' ? mindMapObj.version : 1,
    tags: Array.isArray(mindMapObj.tags) ? mindMapObj.tags : [],
    collaborators: Array.isArray(mindMapObj.collaborators) ? mindMapObj.collaborators : [],
  };
};

// Clean up potentially corrupted mind map arrays
export const sanitizeMindMapArray = (mindMaps: unknown[]): MindMap[] => {
  if (!Array.isArray(mindMaps)) {
    return [];
  }

  return mindMaps
    .filter(mindMap => mindMap && typeof mindMap === 'object' && 'id' in mindMap && mindMap.id)
    .map(mindMap => {
      try {
        return sanitizeMindMap(mindMap);
      } catch (error) {
        console.warn('Skipping corrupted mind map:', mindMap, error);
        return null;
      }
    })
    .filter((mindMap): mindMap is MindMap => mindMap !== null);
};

// Safe localStorage operations for mind maps
export const safeLoadMindMapsFromStorage = (): MindMap[] => {
  try {
    const stored = localStorage.getItem('mind_maps');
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return sanitizeMindMapArray(parsed);
  } catch (error) {
    console.error('Failed to load mind maps from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem('mind_maps');
    return [];
  }
};

// Safe save to localStorage with validation
export const safeSaveMindMapsToStorage = (mindMaps: MindMap[]): boolean => {
  try {
    const sanitized = sanitizeMindMapArray(mindMaps);
    localStorage.setItem('mind_maps', JSON.stringify(sanitized));
    return true;
  } catch (error) {
    console.error('Failed to save mind maps to localStorage:', error);
    return false;
  }
};