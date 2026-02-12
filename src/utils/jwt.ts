import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWTPayload, UserType } from '../types';
export function generateToken(name: string, type: UserType): string {
  const payload: JWTPayload = {
    name,
    type,
  };
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiration,
  } as any);
}
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  return parts[1];
}
