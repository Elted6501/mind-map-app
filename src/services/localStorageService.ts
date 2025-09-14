import { MindMap } from '../types';

interface UserPreferences {
  theme?: 'light' | 'dark';
  defaultZoom?: number;
  gridSize?: number;
  showGrid?: boolean;
  autoSave?: boolean;
  [key: string]: unknown;
}

export class LocalStorageService {
  private static instance: LocalStorageService;

  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  // Mind Map operations
  saveMindMap(mindMap: MindMap): void {
    try {
      const mindMaps = this.getAllMindMaps();
      const existingIndex = mindMaps.findIndex(m => m.id === mindMap.id);
      
      if (existingIndex >= 0) {
        mindMaps[existingIndex] = mindMap;
      } else {
        mindMaps.push(mindMap);
      }
      
      localStorage.setItem('mind_maps', JSON.stringify(mindMaps));
    } catch (error) {
      console.error('Failed to save mind map:', error);
      throw error;
    }
  }

  loadMindMap(id: string): MindMap | null {
    try {
      const mindMaps = this.getAllMindMaps();
      return mindMaps.find(m => m.id === id) || null;
    } catch (error) {
      console.error('Failed to load mind map:', error);
      return null;
    }
  }

  getAllMindMaps(): MindMap[] {
    try {
      const stored = localStorage.getItem('mind_maps');
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to load mind maps from localStorage:', error);
      return [];
    }
  }

  deleteMindMap(id: string): void {
    try {
      const mindMaps = this.getAllMindMaps();
      const filtered = mindMaps.filter(m => m.id !== id);
      localStorage.setItem('mind_maps', JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete mind map:', error);
      throw error;
    }
  }

  // Preferences
  savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem('user_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  }

  loadPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem('user_preferences');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return {};
    }
  }

  // Clear all data
  clearAll(): void {
    try {
      localStorage.removeItem('mind_maps');
      localStorage.removeItem('user_preferences');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token_expiry');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const localStorageService = LocalStorageService.getInstance();