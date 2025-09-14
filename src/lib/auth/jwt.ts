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

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }

    const token = authorization.substring(7);
    const decoded = verifyToken(token);

    await dbConnect();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch {
    throw new Error('Authentication failed');
  }
}

export async function withAuth(
  handler: (request: NextRequest, context: { params?: Record<string, unknown>; user: Record<string, unknown> }) => Promise<Response>
) {
  return async (request: NextRequest, context?: { params?: Record<string, unknown> }) => {
    try {
      const user = await getAuthenticatedUser(request);
      return handler(request, { ...context, user });
    } catch {
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
  };
}