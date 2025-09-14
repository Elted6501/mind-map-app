import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/jwt';
import dbConnect from '@/lib/mongodb';
import { MindMap } from '@/models/MindMap';
import { IMindMap } from '@/models/MindMap';

interface ExportNode {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    fontSize?: number;
    fontWeight?: string;
    shape?: string;
  };
}

interface ExportConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  style?: {
    color?: string;
    width?: number;
    opacity?: number;
  };
}

// GET /api/mindmaps/[id]/export/[format] - Export mind map in specified format
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; format: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const params = await context.params;
    await dbConnect();

    // Verify user has access to the mind map
    const mindMap = await MindMap.findOne({
      _id: params.id,
      $or: [
        { userId: user._id },
        { collaborators: user._id }
      ]
    });

    if (!mindMap) {
      return NextResponse.json(
        { success: false, error: 'Mind map not found or access denied' },
        { status: 404 }
      );
    }

    const format = params.format.toLowerCase();

    switch (format) {
      case 'json':
        return handleJSONExport(mindMap);
      case 'svg':
        return handleSVGExport(mindMap);
      case 'png':
        return handlePNGExport(mindMap);
      case 'pdf':
        return handlePDFExport(mindMap);
      default:
        return NextResponse.json(
          { success: false, error: 'Unsupported export format' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function handleJSONExport(mindMap: IMindMap) {
  const jsonData = JSON.stringify(mindMap, null, 2);
  
  return new NextResponse(jsonData, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${mindMap.title || 'mindmap'}.json"`
    }
  });
}

function handleSVGExport(mindMap: IMindMap) {
  // Calculate canvas bounds
  const nodes = mindMap.nodes || [];
  if (nodes.length === 0) {
    return NextResponse.json(
      { success: false, error: 'No nodes to export' },
      { status: 400 }
    );
  }

  const minX = Math.min(...nodes.map((n: ExportNode) => n.x)) - 50;
  const maxX = Math.max(...nodes.map((n: ExportNode) => n.x + n.width)) + 50;
  const minY = Math.min(...nodes.map((n: ExportNode) => n.y)) - 50;
  const maxY = Math.max(...nodes.map((n: ExportNode) => n.y + n.height)) + 50;
  
  const width = maxX - minX;
  const height = maxY - minY;

  // Generate SVG content
  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}" 
     xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .node-text { font-family: Arial, sans-serif; text-anchor: middle; dominant-baseline: middle; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="white"/>
  
  <!-- Connections -->`;

  // Add connections
  const connections = mindMap.connections || [];
  connections.forEach((conn: ExportConnection) => {
    const fromNode = nodes.find((n: ExportNode) => n.id === conn.fromNodeId);
    const toNode = nodes.find((n: ExportNode) => n.id === conn.toNodeId);
    
    if (fromNode && toNode) {
      const fromX = fromNode.x + fromNode.width / 2;
      const fromY = fromNode.y + fromNode.height / 2;
      const toX = toNode.x + toNode.width / 2;
      const toY = toNode.y + toNode.height / 2;
      
      svgContent += `
  <line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" 
        stroke="${conn.style?.color || '#6B7280'}" 
        stroke-width="${conn.style?.width || 2}" 
        opacity="${conn.style?.opacity || 1}"/>`;
    }
  });

  svgContent += `
  
  <!-- Nodes -->`;

  // Add nodes
  nodes.forEach((node: ExportNode) => {
    const style = node.style || {};
    const shape = style.shape || 'rectangle';
    
    if (shape === 'circle') {
      const radius = Math.min(node.width, node.height) / 2;
      const centerX = node.x + node.width / 2;
      const centerY = node.y + node.height / 2;
      
      svgContent += `
  <circle cx="${centerX}" cy="${centerY}" r="${radius}"
          fill="${style.backgroundColor || '#3B82F6'}" 
          stroke="${style.borderColor || '#D1D5DB'}" 
          stroke-width="${style.borderWidth || 1}"/>
  <text x="${centerX}" y="${centerY}" 
        class="node-text" 
        fill="${style.textColor || '#1F2937'}" 
        font-size="${style.fontSize || 14}"
        font-weight="${style.fontWeight || 'normal'}">${node.text || ''}</text>`;
    } else {
      // Rectangle (default)
      svgContent += `
  <rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}"
        fill="${style.backgroundColor || '#3B82F6'}" 
        stroke="${style.borderColor || '#D1D5DB'}" 
        stroke-width="${style.borderWidth || 1}"
        rx="${style.borderRadius || 8}"/>
  <text x="${node.x + node.width / 2}" y="${node.y + node.height / 2}" 
        class="node-text" 
        fill="${style.textColor || '#1F2937'}" 
        font-size="${style.fontSize || 14}"
        font-weight="${style.fontWeight || 'normal'}">${node.text || ''}</text>`;
    }
  });

  svgContent += `
</svg>`;

  return new NextResponse(svgContent, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Content-Disposition': `attachment; filename="${mindMap.title || 'mindmap'}.svg"`
    }
  });
}

function handlePNGExport(_mindMap: IMindMap) {
  // For PNG export, we'll return a message that it requires client-side processing
  // since server-side canvas rendering requires additional dependencies
  return NextResponse.json({
    success: false,
    error: 'PNG export requires client-side processing. Use the browser export instead.',
    suggestion: 'Consider using SVG export or implementing client-side PNG conversion'
  }, { status: 501 });
}

function handlePDFExport(_mindMap: IMindMap) {
  // For PDF export, we'll return a message that it requires additional setup
  return NextResponse.json({
    success: false,
    error: 'PDF export requires additional setup with libraries like puppeteer or jsPDF.',
    suggestion: 'Consider using SVG export or implementing PDF generation'
  }, { status: 501 });
}