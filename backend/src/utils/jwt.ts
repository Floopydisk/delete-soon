import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '@/models/User';

interface JwtPayload {
  userId: string;
  email: string;
  role: 'superAdmin' | 'admin' | 'pastorate';
}

export const generateToken = (user: IUser): string => {
  const payload = {
    userId: (user._id as any).toString(),
    email: user.email,
    role: user.role
  };

  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  
  return jwt.sign(payload, secret, {
    expiresIn: '7d',
    issuer: 'daystar-forms-api'
  });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};