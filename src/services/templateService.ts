/* eslint-disable @typescript-eslint/no-explicit-any */

interface CreateMindMapData {
  title: string;
  description: string;
  tags: string[];
  nodes: Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'root' | 'branch' | 'leaf' | 'note' | 'task' | 'link';
    style: any;
    parentId: string | null;
    children: string[];
    level: number;
    collapsed: boolean;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
  }>;
  connections: Array<{
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
  }>;
}

export interface MindMapTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  preview: string; // URL or base64 image
  nodes: Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'root' | 'branch' | 'leaf' | 'note' | 'task' | 'link';
    style: any;
  }>;
  connections: Array<{
    id: string;
    sourceId: string;
    targetId: string;
    type: string;
    style: any;
  }>;
}

class TemplateService {
  private templates: MindMapTemplate[] = [
    {
      id: 'project-planning',
      title: 'Project Planning',
      description: 'Comprehensive project planning template with phases, tasks, and milestones',
      category: 'Business',
      tags: ['project', 'planning', 'business', 'tasks'],
      preview: '',
      nodes: [
        {
          id: 'root',
          text: 'Project Name',
          x: 400,
          y: 300,
          width: 180,
          height: 80,
          type: 'root',
          style: {
            backgroundColor: '#1E40AF',
            textColor: '#FFFFFF',
            borderColor: '#1E3A8A',
            borderWidth: 3,
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 'bold',
            shape: 'rectangle'
          }
        },
        {
          id: 'planning',
          text: 'Planning Phase',
          x: 150,
          y: 150,
          width: 160,
          height: 60,
          type: 'branch',
          style: {
            backgroundColor: '#059669',
            textColor: '#FFFFFF',
            borderColor: '#047857',
            borderWidth: 2,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 'semibold',
            shape: 'rectangle'
          }
        },
        {
          id: 'execution',
          text: 'Execution Phase',
          x: 650,
          y: 150,
          width: 160,
          height: 60,
          type: 'branch',
          style: {
            backgroundColor: '#DC2626',
            textColor: '#FFFFFF',
            borderColor: '#B91C1C',
            borderWidth: 2,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 'semibold',
            shape: 'rectangle'
          }
        },
        {
          id: 'monitoring',
          text: 'Monitoring & Control',
          x: 400,
          y: 500,
          width: 180,
          height: 60,
          type: 'branch',
          style: {
            backgroundColor: '#7C2D12',
            textColor: '#FFFFFF',
            borderColor: '#92400E',
            borderWidth: 2,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 'semibold',
            shape: 'rectangle'
          }
        },
        {
          id: 'requirements',
          text: 'Requirements\nGathering',
          x: 50,
          y: 50,
          width: 140,
          height: 60,
          type: 'leaf',
          style: {
            backgroundColor: '#65A30D',
            textColor: '#FFFFFF',
            borderColor: '#4D7C0F',
            borderWidth: 1,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 'normal',
            shape: 'rectangle'
          }
        },
        {
          id: 'timeline',
          text: 'Timeline\nCreation',
          x: 250,
          y: 50,
          width: 140,
          height: 60,
          type: 'leaf',
          style: {
            backgroundColor: '#65A30D',
            textColor: '#FFFFFF',
            borderColor: '#4D7C0F',
            borderWidth: 1,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 'normal',
            shape: 'rectangle'
          }
        },
        {
          id: 'development',
          text: 'Development\nTasks',
          x: 550,
          y: 50,
          width: 140,
          height: 60,
          type: 'leaf',
          style: {
            backgroundColor: '#DC2626',
            textColor: '#FFFFFF',
            borderColor: '#B91C1C',
            borderWidth: 1,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 'normal',
            shape: 'rectangle'
          }
        },
        {
          id: 'testing',
          text: 'Testing &\nQA',
          x: 750,
          y: 50,
          width: 140,
          height: 60,
          type: 'leaf',
          style: {
            backgroundColor: '#DC2626',
            textColor: '#FFFFFF',
            borderColor: '#B91C1C',
            borderWidth: 1,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 'normal',
            shape: 'rectangle'
          }
        }
      ],
      connections: [
        {
          id: 'root-planning',
          sourceId: 'root',
          targetId: 'planning',
          type: 'curved',
          style: { stroke: '#6B7280', strokeWidth: 3 }
        },
        {
          id: 'root-execution',
          sourceId: 'root',
          targetId: 'execution',
          type: 'curved',
          style: { stroke: '#6B7280', strokeWidth: 3 }
        },
        {
          id: 'root-monitoring',
          sourceId: 'root',
          targetId: 'monitoring',
          type: 'curved',
          style: { stroke: '#6B7280', strokeWidth: 3 }
        },
        {
          id: 'planning-requirements',
          sourceId: 'planning',
          targetId: 'requirements',
          type: 'curved',
          style: { stroke: '#059669', strokeWidth: 2 }
        },
        {
          id: 'planning-timeline',
          sourceId: 'planning',
          targetId: 'timeline',
          type: 'curved',
          style: { stroke: '#059669', strokeWidth: 2 }
        },
        {
          id: 'execution-development',
          sourceId: 'execution',
          targetId: 'development',
          type: 'curved',
          style: { stroke: '#DC2626', strokeWidth: 2 }
        },
        {
          id: 'execution-testing',
          sourceId: 'execution',
          targetId: 'testing',
          type: 'curved',
          style: { stroke: '#DC2626', strokeWidth: 2 }
        }
      ]
    },
    {
      id: 'brainstorming',
      title: 'Brainstorming Session',
      description: 'Creative brainstorming template for idea generation and organization',
      category: 'Creative',
      tags: ['brainstorming', 'ideas', 'creative', 'innovation'],
      preview: '',
      nodes: [
        {
          id: 'central-idea',
          text: 'Central Topic',
          x: 400,
          y: 300,
          width: 160,
          height: 80,
          type: 'root',
          style: {
            backgroundColor: '#7C3AED',
            textColor: '#FFFFFF',
            borderColor: '#6D28D9',
            borderWidth: 3,
            borderRadius: 40,
            fontSize: 16,
            fontWeight: 'bold',
            shape: 'circle'
          }
        },
        {
          id: 'idea1',
          text: 'Idea 1',
          x: 200,
          y: 150,
          width: 120,
          height: 60,
          type: 'branch',
          style: {
            backgroundColor: '#F59E0B',
            textColor: '#FFFFFF',
            borderColor: '#D97706',
            borderWidth: 2,
            borderRadius: 30,
            fontSize: 14,
            fontWeight: 'medium',
            shape: 'circle'
          }
        },
        {
          id: 'idea2',
          text: 'Idea 2',
          x: 600,
          y: 150,
          width: 120,
          height: 60,
          type: 'branch',
          style: {
            backgroundColor: '#EF4444',
            textColor: '#FFFFFF',
            borderColor: '#DC2626',
            borderWidth: 2,
            borderRadius: 30,
            fontSize: 14,
            fontWeight: 'medium',
            shape: 'circle'
          }
        },
        {
          id: 'idea3',
          text: 'Idea 3',
          x: 200,
          y: 450,
          width: 120,
          height: 60,
          type: 'branch',
          style: {
            backgroundColor: '#10B981',
            textColor: '#FFFFFF',
            borderColor: '#059669',
            borderWidth: 2,
            borderRadius: 30,
            fontSize: 14,
            fontWeight: 'medium',
            shape: 'circle'
          }
        },
        {
          id: 'idea4',
          text: 'Idea 4',
          x: 600,
          y: 450,
          width: 120,
          height: 60,
          type: 'branch',
          style: {
            backgroundColor: '#3B82F6',
            textColor: '#FFFFFF',
            borderColor: '#2563EB',
            borderWidth: 2,
            borderRadius: 30,
            fontSize: 14,
            fontWeight: 'medium',
            shape: 'circle'
          }
        }
      ],
      connections: [
        {
          id: 'central-idea1',
          sourceId: 'central-idea',
          targetId: 'idea1',
          type: 'curved',
          style: { stroke: '#7C3AED', strokeWidth: 3 }
        },
        {
          id: 'central-idea2',
          sourceId: 'central-idea',
          targetId: 'idea2',
          type: 'curved',
          style: { stroke: '#7C3AED', strokeWidth: 3 }
        },
        {
          id: 'central-idea3',
          sourceId: 'central-idea',
          targetId: 'idea3',
          type: 'curved',
          style: { stroke: '#7C3AED', strokeWidth: 3 }
        },
        {
          id: 'central-idea4',
          sourceId: 'central-idea',
          targetId: 'idea4',
          type: 'curved',
          style: { stroke: '#7C3AED', strokeWidth: 3 }
        }
      ]
    },
    {
      id: 'swot-analysis',
      title: 'SWOT Analysis',
      description: 'Strategic planning template for analyzing Strengths, Weaknesses, Opportunities, and Threats',
      category: 'Business',
      tags: ['swot', 'analysis', 'strategy', 'business'],
      preview: '',
      nodes: [
        {
          id: 'swot-center',
          text: 'SWOT Analysis',
          x: 400,
          y: 300,
          width: 160,
          height: 80,
          type: 'root',
          style: {
            backgroundColor: '#374151',
            textColor: '#FFFFFF',
            borderColor: '#1F2937',
            borderWidth: 3,
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 'bold',
            shape: 'rectangle'
          }
        },
        {
          id: 'strengths',
          text: 'Strengths',
          x: 200,
          y: 150,
          width: 140,
          height: 80,
          type: 'branch',
          style: {
            backgroundColor: '#059669',
            textColor: '#FFFFFF',
            borderColor: '#047857',
            borderWidth: 2,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 'semibold',
            shape: 'rectangle'
          }
        },
        {
          id: 'weaknesses',
          text: 'Weaknesses',
          x: 600,
          y: 150,
          width: 140,
          height: 80,
          type: 'branch',
          style: {
            backgroundColor: '#DC2626',
            textColor: '#FFFFFF',
            borderColor: '#B91C1C',
            borderWidth: 2,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 'semibold',
            shape: 'rectangle'
          }
        },
        {
          id: 'opportunities',
          text: 'Opportunities',
          x: 200,
          y: 450,
          width: 140,
          height: 80,
          type: 'branch',
          style: {
            backgroundColor: '#2563EB',
            textColor: '#FFFFFF',
            borderColor: '#1D4ED8',
            borderWidth: 2,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 'semibold',
            shape: 'rectangle'
          }
        },
        {
          id: 'threats',
          text: 'Threats',
          x: 600,
          y: 450,
          width: 140,
          height: 80,
          type: 'branch',
          style: {
            backgroundColor: '#7C2D12',
            textColor: '#FFFFFF',
            borderColor: '#92400E',
            borderWidth: 2,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 'semibold',
            shape: 'rectangle'
          }
        }
      ],
      connections: [
        {
          id: 'center-strengths',
          sourceId: 'swot-center',
          targetId: 'strengths',
          type: 'curved',
          style: { stroke: '#059669', strokeWidth: 3 }
        },
        {
          id: 'center-weaknesses',
          sourceId: 'swot-center',
          targetId: 'weaknesses',
          type: 'curved',
          style: { stroke: '#DC2626', strokeWidth: 3 }
        },
        {
          id: 'center-opportunities',
          sourceId: 'swot-center',
          targetId: 'opportunities',
          type: 'curved',
          style: { stroke: '#2563EB', strokeWidth: 3 }
        },
        {
          id: 'center-threats',
          sourceId: 'swot-center',
          targetId: 'threats',
          type: 'curved',
          style: { stroke: '#7C2D12', strokeWidth: 3 }
        }
      ]
    },
    {
      id: 'learning-roadmap',
      title: 'Learning Roadmap',
      description: 'Educational template for organizing learning paths and skill development',
      category: 'Education',
      tags: ['learning', 'education', 'skills', 'roadmap'],
      preview: '',
      nodes: [
        {
          id: 'skill-goal',
          text: 'Learning Goal',
          x: 400,
          y: 100,
          width: 180,
          height: 60,
          type: 'root',
          style: {
            backgroundColor: '#1E40AF',
            textColor: '#FFFFFF',
            borderColor: '#1E3A8A',
            borderWidth: 3,
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 'bold',
            shape: 'rectangle'
          }
        },
        {
          id: 'fundamentals',
          text: 'Fundamentals',
          x: 150,
          y: 250,
          width: 140,
          height: 60,
          type: 'branch',
          style: {
            backgroundColor: '#059669',
            textColor: '#FFFFFF',
            borderColor: '#047857',
            borderWidth: 2,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 'semibold',
            shape: 'rectangle'
          }
        },
        {
          id: 'intermediate',
          text: 'Intermediate',
          x: 400,
          y: 250,
          width: 140,
          height: 60,
          type: 'branch',
          style: {
            backgroundColor: '#F59E0B',
            textColor: '#FFFFFF',
            borderColor: '#D97706',
            borderWidth: 2,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 'semibold',
            shape: 'rectangle'
          }
        },
        {
          id: 'advanced',
          text: 'Advanced',
          x: 650,
          y: 250,
          width: 140,
          height: 60,
          type: 'branch',
          style: {
            backgroundColor: '#DC2626',
            textColor: '#FFFFFF',
            borderColor: '#B91C1C',
            borderWidth: 2,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 'semibold',
            shape: 'rectangle'
          }
        },
        {
          id: 'practice',
          text: 'Practice\nProjects',
          x: 300,
          y: 400,
          width: 120,
          height: 60,
          type: 'task',
          style: {
            backgroundColor: '#7C3AED',
            textColor: '#FFFFFF',
            borderColor: '#6D28D9',
            borderWidth: 2,
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 'normal',
            shape: 'rectangle'
          }
        },
        {
          id: 'certification',
          text: 'Certification',
          x: 500,
          y: 400,
          width: 120,
          height: 60,
          type: 'task',
          style: {
            backgroundColor: '#7C3AED',
            textColor: '#FFFFFF',
            borderColor: '#6D28D9',
            borderWidth: 2,
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 'normal',
            shape: 'rectangle'
          }
        }
      ],
      connections: [
        {
          id: 'goal-fundamentals',
          sourceId: 'skill-goal',
          targetId: 'fundamentals',
          type: 'curved',
          style: { stroke: '#059669', strokeWidth: 3 }
        },
        {
          id: 'fundamentals-intermediate',
          sourceId: 'fundamentals',
          targetId: 'intermediate',
          type: 'curved',
          style: { stroke: '#F59E0B', strokeWidth: 2 }
        },
        {
          id: 'intermediate-advanced',
          sourceId: 'intermediate',
          targetId: 'advanced',
          type: 'curved',
          style: { stroke: '#DC2626', strokeWidth: 2 }
        },
        {
          id: 'intermediate-practice',
          sourceId: 'intermediate',
          targetId: 'practice',
          type: 'curved',
          style: { stroke: '#7C3AED', strokeWidth: 2 }
        },
        {
          id: 'advanced-certification',
          sourceId: 'advanced',
          targetId: 'certification',
          type: 'curved',
          style: { stroke: '#7C3AED', strokeWidth: 2 }
        }
      ]
    }
  ];

  getTemplates(): MindMapTemplate[] {
    return this.templates;
  }

  getTemplatesByCategory(category: string): MindMapTemplate[] {
    return this.templates.filter(template => template.category === category);
  }

  getTemplateById(id: string): MindMapTemplate | undefined {
    return this.templates.find(template => template.id === id);
  }

  getCategories(): string[] {
    const categories = new Set(this.templates.map(template => template.category));
    return Array.from(categories);
  }

  searchTemplates(query: string): MindMapTemplate[] {
    const searchTerm = query.toLowerCase();
    return this.templates.filter(template =>
      template.title.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  createMindMapFromTemplate(template: MindMapTemplate, customTitle?: string): CreateMindMapData {
    // Calculate levels for nodes based on root node
    const nodesWithLevels = template.nodes.map(node => {
      let level = 0;
      if (node.type === 'root') {
        level = 0;
      } else {
        // For non-root nodes, set level based on type
        level = node.type === 'branch' ? 1 : 2;
      }
      
      return {
        ...node,
        parentId: null,
        children: [],
        level,
        collapsed: false,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    // Map connections to use correct field names
    const mappedConnections = template.connections.map(connection => ({
      id: connection.id,
      fromNodeId: connection.sourceId,
      toNodeId: connection.targetId,
      type: connection.type as 'straight' | 'curved' | 'stepped',
      style: {
        color: connection.style?.color || '#6b7280',
        width: connection.style?.width || 2,
        style: (connection.style?.style as 'solid' | 'dashed' | 'dotted') || 'solid',
        opacity: connection.style?.opacity || 1
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return {
      title: customTitle || template.title,
      description: template.description,
      tags: [...template.tags, 'from-template'],
      nodes: nodesWithLevels,
      connections: mappedConnections
    };
  }
}

export const templateService = new TemplateService();