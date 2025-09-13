import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export async function verifyToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId?: string;
      id?: string;
      email: string;
      name: string;
    };
    return {
      id: decoded.userId || decoded.id || '',
      email: decoded.email,
      name: decoded.name,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}