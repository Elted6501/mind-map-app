import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { User } from '@/models/User';
import dbConnect from '@/lib/mongodb';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    _id: string;
    email: string;
    name: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not set');
  throw new Error('JWT_SECRET is required');
}

// TypeScript assertion - we know JWT_SECRET is defined after the check
const jwtSecret: string = JWT_SECRET;

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: JWT_EXPIRE,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, jwtSecret);
  
  if (typeof decoded === 'string') {
    throw new Error('Invalid token format');
  }
  
  // Ensure the decoded token has the required properties
  if (!decoded || typeof decoded !== 'object' || !('userId' in decoded) || !('email' in decoded)) {
    throw new Error('Invalid token payload');
  }
  
  return decoded as TokenPayload;
}

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }

    const token = authorization.substring(7);
    
    let decoded: TokenPayload;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new Error('Invalid or expired token');
    }

    await dbConnect();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    // Re-throw the original error instead of masking it
    throw error;
  }
}

export async function withAuth(
  handler: (request: NextRequest, context: { params?: Record<string, unknown>; user: Record<string, unknown> }) => Promise<Response>
) {
  return async (request: NextRequest, context?: { params?: Record<string, unknown> }) => {
    try {
      const user = await getAuthenticatedUser(request);
      return handler(request, { ...context, user });
    } catch (error) {
      console.error('Auth middleware error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}