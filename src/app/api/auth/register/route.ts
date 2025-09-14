import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { generateToken } from '@/lib/auth/jwt';

interface MongooseError extends Error {
  name: string;
  errors?: Record<string, { message: string }>;
  code?: number;
}

interface ValidationError {
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Name, email and password are required'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'User already exists with this email'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create new user
    const user = new User({
      name,
      email,
      password, // Will be hashed by the pre-save middleware
    });

    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });

    // Return user data without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: userResponse,
          token
        },
        message: 'Registration successful'
      }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    const mongoError = error as MongooseError;
    
    // Handle mongoose validation errors
    if (mongoError.name === 'ValidationError') {
      const errors = Object.values(mongoError.errors || {}).map((err: ValidationError) => err.message);
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