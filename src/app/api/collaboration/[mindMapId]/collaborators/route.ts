import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { MindMap } from '@/models/MindMap';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';

// GET /api/collaboration/[mindMapId]/collaborators - Get collaborators for a mind map
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mindMapId: string }> }
) {
  try {
    await connectDB();

    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Await params if it's a Promise
    const resolvedParams = await params;

    const mindMap = await MindMap.findOne({
      _id: resolvedParams.mindMapId,
      $or: [
        { userId: user.id },
        { collaborators: user.id }
      ]
    }).populate('collaborators', 'name email avatar');

    if (!mindMap) {
      return NextResponse.json(
        { success: false, error: 'Mind map not found or you do not have permission to view it' },
        { status: 404 }
      );
    }

    // Get owner information
    const owner = await User.findById(mindMap.userId).select('name email avatar');

    return NextResponse.json({
      success: true,
      data: {
        owner,
        collaborators: mindMap.collaborators,
      },
    });
  } catch (error) {
    console.error('Get collaborators error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/collaboration/[mindMapId]/collaborators - Add a collaborator
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mindMapId: string }> }
) {
  try {
    await connectDB();

    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Await params if it's a Promise
    const resolvedParams = await params;

    // Check if mind map exists and user has permission
    const mindMap = await MindMap.findOne({
      _id: resolvedParams.mindMapId,
      userId: user.id, // Only owner can add collaborators
    });

    if (!mindMap) {
      return NextResponse.json(
        { success: false, error: 'Mind map not found or you do not have permission to add collaborators' },
        { status: 404 }
      );
    }

    // Find user by email
    const collaborator = await User.findOne({ email });

    if (!collaborator) {
      return NextResponse.json(
        { success: false, error: 'User not found with this email' },
        { status: 404 }
      );
    }

    // Check if user is trying to add themselves
    if (collaborator._id.toString() === user.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot add yourself as a collaborator' },
        { status: 400 }
      );
    }

    // Check if user is already a collaborator
    if (mindMap.collaborators.includes(collaborator._id)) {
      return NextResponse.json(
        { success: false, error: 'User is already a collaborator' },
        { status: 400 }
      );
    }

    // Add collaborator
    mindMap.collaborators.push(collaborator._id);
    await mindMap.save();

    // Populate collaborator info for response
    await mindMap.populate('collaborators', 'name email avatar');

    return NextResponse.json({
      success: true,
      data: {
        collaborator: collaborator,
        message: 'Collaborator added successfully',
      },
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}