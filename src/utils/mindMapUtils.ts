// Utility functions to ensure mind map data integrity

import { MindMap, DEFAULT_CANVAS_STATE } from '../types';

// Ensure mind map has all required properties with proper defaults
export const sanitizeMindMap = (mindMap: any): MindMap => {
  if (!mindMap || typeof mindMap !== 'object') {
    throw new Error('Invalid mind map data');
  }

  return {
    id: mindMap.id || '',
    title: mindMap.title || 'Untitled',
    description: mindMap.description || '',
    createdAt: mindMap.createdAt ? new Date(mindMap.createdAt) : new Date(),
    updatedAt: mindMap.updatedAt ? new Date(mindMap.updatedAt) : new Date(),
    userId: mindMap.userId || 'unknown',
    isPublic: Boolean(mindMap.isPublic),
    nodes: Array.isArray(mindMap.nodes) ? mindMap.nodes : [],
    connections: Array.isArray(mindMap.connections) ? mindMap.connections : [],
    canvas: mindMap.canvas && typeof mindMap.canvas === 'object' 
      ? {
          ...DEFAULT_CANVAS_STATE,
          ...mindMap.canvas,
          selectedNodes: Array.isArray(mindMap.canvas.selectedNodes) 
            ? mindMap.canvas.selectedNodes 
            : [],
          editingNode: mindMap.canvas.editingNode || null,
        }
      : { ...DEFAULT_CANVAS_STATE },
    version: typeof mindMap.version === 'number' ? mindMap.version : 1,
    tags: Array.isArray(mindMap.tags) ? mindMap.tags : [],
    collaborators: Array.isArray(mindMap.collaborators) ? mindMap.collaborators : [],
  };
};

// Clean up potentially corrupted mind map arrays
export const sanitizeMindMapArray = (mindMaps: any[]): MindMap[] => {
  if (!Array.isArray(mindMaps)) {
    return [];
  }

  return mindMaps
    .filter(mindMap => mindMap && typeof mindMap === 'object' && mindMap.id)
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