import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt';
import { UserType, JWTPayload } from '../types';
export interface AuthRequest extends Request {
  user?: JWTPayload;
}
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid Bearer token.',
      });
      return;
    }
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    });
  }
}
export function authorize(...allowedTypes: UserType[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }
    if (!allowedTypes.includes(req.user.type)) {
      res.status(403).json({
        success: false,
        error: `Access forbidden. Required user type: ${allowedTypes.join(' or ')}`,
      });
      return;
    }
    next();
  };
}
