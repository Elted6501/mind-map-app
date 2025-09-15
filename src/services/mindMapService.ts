import { MindMap } from '../types';
import { apiClient, ApiResponse } from './apiClient';

export interface MindMapResponse {
  mindMaps: MindMap[];
}

export interface CreateMindMapRequest {
  title: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateMindMapRequest {
  title?: string;
  description?: string;
  isPublic?: boolean;
  nodes?: MindMap['nodes'];
  connections?: MindMap['connections'];
  canvas?: MindMap['canvas'];
}

export class MindMapService {
  // Get all mind maps for the current user
  static async getAllMindMaps(): Promise<MindMap[]> {
    const response = await apiClient.get<ApiResponse<MindMap[]>>('/mindmaps');
    return response.data;
  }

  // Get a specific mind map by ID
  static async getMindMap(id: string): Promise<MindMap> {
    const response = await apiClient.get<ApiResponse<MindMap>>(`/mindmaps/${id}`);
    return response.data;
  }

  // Create a new mind map
  static async createMindMap(data: CreateMindMapRequest): Promise<MindMap> {
    const response = await apiClient.post<ApiResponse<MindMap>>('/mindmaps', data);
    return response.data;
  }

  // Update an existing mind map
  static async updateMindMap(id: string, data: UpdateMindMapRequest): Promise<MindMap> {
    const response = await apiClient.put<ApiResponse<MindMap>>(`/mindmaps/${id}`, data);
    return response.data;
  }

  // Delete a mind map
  static async deleteMindMap(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/mindmaps/${id}`);
  }

  // Duplicate a mind map
  static async duplicateMindMap(id: string): Promise<MindMap> {
    const response = await apiClient.post<ApiResponse<MindMap>>(`/mindmaps/${id}/duplicate`);
    return response.data;
  }

  // Export a mind map
  static async exportMindMap(id: string, format: string): Promise<Blob> {
    const response = await fetch(`/api/mindmaps/${id}/export/${format}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return response.blob();
  }

  // Import a mind map
  static async importMindMap(file: File): Promise<MindMap> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/mindmaps/import', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Import failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }
}