import { apiClient } from './apiClient';

// Interfaces for import data structures
interface ImportNode {
  id?: string;
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  type?: 'root' | 'branch' | 'leaf' | 'note' | 'task' | 'link';
  level?: number;
  color?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: string;
  shape?: 'rectangle' | 'circle';
  style?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    fontSize?: number;
    fontWeight?: string;
    shape?: 'rectangle' | 'circle';
  };
}

interface ImportConnection {
  id?: string;
  sourceId?: string;
  targetId?: string;
  fromNodeId?: string;
  toNodeId?: string;
  type?: 'straight' | 'curved' | 'stepped';
  color?: string;
  width?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  opacity?: number;
  style?: {
    color?: string;
    width?: number;
    style?: 'solid' | 'dashed' | 'dotted';
    opacity?: number;
  };
}

interface ImportData {
  title?: string;
  description?: string;
  tags?: string[];
  nodes?: ImportNode[];
  connections?: ImportConnection[];
}

export interface ImportValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ImportResult {
  success: boolean;
  mindMapId?: string;
  errors?: ImportValidationError[];
  warnings?: string[];
  imported?: {
    nodes: number;
    connections: number;
  };
}

class ImportService {
  async importFromJSON(file: File): Promise<ImportResult> {
    try {
      const content = await this.readFileAsText(file);
      const data: ImportData = JSON.parse(content);
      
      // Transform nodes to match database schema
      const transformedNodes = (data.nodes || []).map((node: ImportNode, index: number) => ({
        id: node.id || `node-${index}`,
        text: node.text || 'Untitled Node',
        x: node.x || 0,
        y: node.y || 0,
        width: node.width || 160,
        height: node.height || 60,
        type: this.determineNodeType(node, index),
        level: this.calculateNodeLevel(node, data.nodes || [], index),
        parentId: null, // Will be calculated based on connections
        children: [],
        collapsed: false,
        style: {
          backgroundColor: node.color || node.style?.backgroundColor || '#ffffff',
          textColor: node.textColor || node.style?.textColor || '#1f2937',
          borderColor: node.borderColor || node.style?.borderColor || '#d1d5db',
          borderWidth: node.borderWidth || node.style?.borderWidth || 1,
          borderRadius: node.borderRadius || node.style?.borderRadius || 8,
          fontSize: node.fontSize || node.style?.fontSize || 14,
          fontWeight: node.fontWeight || node.style?.fontWeight || 'normal',
          shape: (node.shape || node.style?.shape || 'rectangle') as 'rectangle' | 'circle'
        },
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // Transform connections to match database schema  
      const transformedConnections = (data.connections || []).map((conn: ImportConnection, index: number) => ({
        id: conn.id || `conn-${index}`,
        fromNodeId: conn.sourceId || conn.fromNodeId || '',
        toNodeId: conn.targetId || conn.toNodeId || '',
        type: (conn.type || 'straight') as 'straight' | 'curved' | 'stepped',
        style: {
          color: conn.color || conn.style?.color || '#6b7280',
          width: conn.width || conn.style?.width || 2,
          style: (conn.style?.style || conn.lineStyle || 'solid') as 'solid' | 'dashed' | 'dotted',
          opacity: conn.opacity || conn.style?.opacity || 1
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const transformedData = {
        title: data.title || 'Imported Mind Map',
        description: data.description || '',
        tags: data.tags || [],
        nodes: transformedNodes,
        connections: transformedConnections
      };

      const response = await apiClient.post<{ success: boolean; data: { _id: string } }>('/mindmaps', transformedData);

      return {
        success: true,
        mindMapId: response.data._id,
        imported: {
          nodes: transformedNodes.length,
          connections: transformedConnections.length
        }
      };

    } catch (error) {
      console.error('JSON import error:', error);
      return {
        success: false,
        errors: [{ field: 'general', message: 'Import failed: ' + (error as Error).message }]
      };
    }
  }

  private determineNodeType(node: ImportNode, index: number): 'root' | 'branch' | 'leaf' | 'note' | 'task' | 'link' {
    if (node.type) return node.type;
    if (index === 0 || node.id === 'root') return 'root';
    return 'branch';
  }

  private calculateNodeLevel(node: ImportNode, allNodes: ImportNode[], index: number): number {
    if (node.level !== undefined) return node.level;
    if (index === 0 || node.id === 'root') return 0;
    // Simple heuristic: calculate based on Y position relative to root
    const rootNode = allNodes[0];
    const yDiff = Math.abs((node.y || 0) - (rootNode?.y || 0));
    return yDiff > 100 ? (yDiff > 200 ? 2 : 1) : 0;
  }

  async importFromCSV(file: File): Promise<ImportResult> {
    try {
      const content = await this.readFileAsText(file);
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        return {
          success: false,
          errors: [{ field: 'file', message: 'CSV file is empty' }]
        };
      }

      // Map various possible column names to our standard names
      const columnMap: Record<string, string> = {
        'text': 'text',
        'node text': 'text', 
        'title': 'text',
        'name': 'text',
        'node id': 'id',
        'id': 'id',
        'parent id': 'parentId',
        'x': 'x',
        'x position': 'x',
        'x pos': 'x',
        'y': 'y', 
        'y position': 'y',
        'y pos': 'y',
        'width': 'width',
        'height': 'height',
        'type': 'type',
        'node type': 'type',
        'color': 'color',
        'background color': 'color',
        'backgroundcolor': 'color',
        'shape': 'shape',
        'font size': 'fontSize',
        'fontsize': 'fontSize',
        'font weight': 'fontWeight',
        'fontweight': 'fontWeight'
      };

      // Parse CSV header and normalize column names
      const header = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());

      // Find the text column (required)
      const textColumnIndex = header.findIndex(col => 
        columnMap[col] === 'text' || col.includes('text') || col.includes('name') || col.includes('title')
      );
      
      if (textColumnIndex === -1) {
        return {
          success: false,
          errors: [{ 
            field: 'header', 
            message: `CSV must contain a text/name/title column. Found columns: ${header.join(', ')}` 
          }]
        };
      }

      // Parse data rows
      const nodes = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const nodeData: Record<string, string> = {};
        
        header.forEach((col, i) => {
          const standardCol = columnMap[col] || col;
          nodeData[standardCol] = values[i] || '';
        });

        return {
          id: `imported-node-${index}`,
          text: nodeData.text || values[textColumnIndex] || `Node ${index + 1}`,
          x: parseInt(nodeData.x) || (index * 200 + 100),
          y: parseInt(nodeData.y) || (Math.floor(index / 5) * 150 + 100),
          width: parseInt(nodeData.width) || 160,
          height: parseInt(nodeData.height) || 60,
          type: (nodeData.type || (index === 0 ? 'root' : 'branch')) as 'root' | 'branch' | 'leaf',
          level: parseInt(nodeData.level) || (index === 0 ? 0 : 1),
          parentId: null,
          children: [],
          collapsed: false,
          style: {
            backgroundColor: nodeData.color || nodeData.backgroundColor || '#ffffff',
            textColor: nodeData.textColor || '#1f2937',
            borderColor: nodeData.borderColor || '#d1d5db',
            borderWidth: parseInt(nodeData.borderWidth) || 1,
            borderRadius: parseInt(nodeData.borderRadius) || 8,
            fontSize: parseInt(nodeData.fontSize) || 14,
            fontWeight: nodeData.fontWeight || 'normal',
            shape: (nodeData.shape || 'rectangle') as 'rectangle' | 'circle'
          },
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });

      // Create connections based on Parent ID relationships
      const connections: Array<{
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
      }> = [];
      nodes.forEach((node, index) => {
        const originalRow = lines[index + 1].split(',').map(v => v.trim().replace(/"/g, ''));
        const nodeData: Record<string, string> = {};
        
        header.forEach((col, i) => {
          const standardCol = columnMap[col] || col;
          nodeData[standardCol] = originalRow[i] || '';
        });

        const parentId = nodeData.parentId || nodeData['parent id'];
        if (parentId && parentId.trim()) {
          // Find the parent node
          const parentNode = nodes.find(n => n.id.includes(parentId) || n.text.toLowerCase().includes(parentId.toLowerCase()));
          if (parentNode) {
            connections.push({
              id: `conn-${node.id}-${parentNode.id}`,
              fromNodeId: parentNode.id,
              toNodeId: node.id,
              type: 'straight' as const,
              style: {
                color: '#6b7280',
                width: 2,
                style: 'solid' as const,
                opacity: 1
              },
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      });

      const transformedData = {
        title: `Imported from ${file.name}`,
        description: `Mind map imported from CSV file on ${new Date().toLocaleDateString()}`,
        tags: ['imported', 'csv'],
        nodes,
        connections
      };

      const response = await apiClient.post<{ success: boolean; data: { _id: string } }>('/mindmaps', transformedData);

      return {
        success: true,
        mindMapId: response.data._id,
        imported: {
          nodes: nodes.length,
          connections: connections.length
        }
      };

    } catch (error) {
      console.error('CSV import error:', error);
      return {
        success: false,
        errors: [{ field: 'general', message: 'CSV import failed: ' + (error as Error).message }]
      };
    }
  }

  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

export const importService = new ImportService();
