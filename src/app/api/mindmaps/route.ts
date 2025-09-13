import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/jwt';
import dbConnect from '@/lib/mongodb';
import { MindMap } from '@/models/MindMap';

// GET /api/mindmaps - Get all mind maps for the user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    await dbConnect();

    const mindMaps = await MindMap.find({ 
      $or: [
        { userId: user._id },
        { collaborators: user._id }
      ]
    })
    .select('title description createdAt updatedAt isPublic tags nodeCount')
    .sort({ updatedAt: -1 });

    return new Response(
      JSON.stringify({
        success: true,
        count: mindMaps.length,
        data: mindMaps,
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Get mind maps error:', error);
    
    if (error instanceof Error && error.message === 'Authentication failed') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized access'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// POST /api/mindmaps - Create a new mind map
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    await dbConnect();
    
    const body = await request.json();
    const { title, description, isPublic, tags } = body;

    // Validate required fields
    if (!title) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Title is required'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create new mind map
    const mindMap = new MindMap({
      title,
      description,
      userId: user._id,
      isPublic: isPublic || false,
      tags: tags || [],
      nodes: [],
      connections: [],
      canvas: {
        zoom: 1,
        panX: 0,
        panY: 0,
        gridSize: 20,
        showGrid: false,
        snapToGrid: false,
        selectedNodes: [],
        editingNode: null,
      }
    });

    await mindMap.save();

    return new Response(
      JSON.stringify({
        success: true,
        data: mindMap,
        message: 'Mind map created successfully'
      }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Create mind map error:', error);
    
    if (error instanceof Error && error.message === 'Authentication failed') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized access'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: errors.join(', ')
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}