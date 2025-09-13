import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/jwt';
import dbConnect from '@/lib/mongodb';
import { MindMap } from '@/models/MindMap';

// GET /api/mindmaps/[id] - Get a specific mind map
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const params = await context.params;
    await dbConnect();

    const mindMap = await MindMap.findOne({
      _id: params.id,
      $or: [
        { userId: user._id },
        { collaborators: user._id }
      ]
    });

    if (!mindMap) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Mind map not found'
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: mindMap
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Get mind map error:', error);
    
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

// PUT /api/mindmaps/[id] - Update a mind map
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const params = await context.params;
    await dbConnect();
    
    const body = await request.json();

    // Find the mind map
    const mindMap = await MindMap.findOne({
      _id: params.id,
      userId: user._id // Only the owner can update
    });

    if (!mindMap) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Mind map not found or you do not have permission to update it'
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update the mind map
    Object.assign(mindMap, body);
    await mindMap.save();

    return new Response(
      JSON.stringify({
        success: true,
        data: mindMap,
        message: 'Mind map updated successfully'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Update mind map error:', error);
    
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

// DELETE /api/mindmaps/[id] - Delete a mind map
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const params = await context.params;
    await dbConnect();

    const mindMap = await MindMap.findOne({
      _id: params.id,
      userId: user._id // Only the owner can delete
    });

    if (!mindMap) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Mind map not found or you do not have permission to delete it'
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await MindMap.findByIdAndDelete(params.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mind map deleted successfully'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Delete mind map error:', error);
    
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