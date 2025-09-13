import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get full user data from database
    const userData = await User.findById(user.id).select('-password');
    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userResponse = {
      id: userData._id,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      isEmailVerified: userData.isEmailVerified,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}