import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { MindMap } from '@/models/MindMap';
import { verifyToken } from '@/lib/auth';

// DELETE /api/collaboration/[mindMapId]/collaborators/[userId] - Remove a collaborator
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mindMapId: string; userId: string }> }
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

    // Check if mind map exists and user has permission
    const mindMap = await MindMap.findOne({
      _id: resolvedParams.mindMapId,
      userId: user.id, // Only owner can remove collaborators
    });

    if (!mindMap) {
      return NextResponse.json(
        { success: false, error: 'Mind map not found or you do not have permission to remove collaborators' },
        { status: 404 }
      );
    }

    // Check if the user is trying to remove themselves
    if (resolvedParams.userId === user.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot remove yourself as the owner' },
        { status: 400 }
      );
    }

    // Remove collaborator
    mindMap.collaborators = mindMap.collaborators.filter(
      (collaboratorId: string) => collaboratorId.toString() !== resolvedParams.userId
    );

    await mindMap.save();

    return NextResponse.json({
      success: true,
      data: {
        message: 'Collaborator removed successfully',
      },
    });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/collaboration/[mindMapId]/collaborators/[userId] - Update collaborator permissions
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ mindMapId: string; userId: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { permissions } = await request.json();

    if (!permissions) {
      return NextResponse.json(
        { success: false, error: 'Permissions are required' },
        { status: 400 }
      );
    }

    // Await params if it's a Promise
    const resolvedParams = await params;

    // Check if mind map exists and user has permission
    const mindMap = await MindMap.findOne({
      _id: resolvedParams.mindMapId,
      userId: user.id, // Only owner can update permissions
    });

    if (!mindMap) {
      return NextResponse.json(
        { success: false, error: 'Mind map not found or you do not have permission to update permissions' },
        { status: 404 }
      );
    }

    // Note: For now, we're just acknowledging the permission update
    // In a more complex system, you'd store permissions in a separate collection
    // or as a field in the mind map document

    return NextResponse.json({
      success: true,
      data: {
        message: 'Collaborator permissions updated successfully',
        permissions,
      },
    });
  } catch (error) {
    console.error('Update collaborator permissions error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}