import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors,
    });
    return;
  }
  if (err.name === 'AppError') {
    res.status((err as any).statusCode || 400).json({
      success: false,
      error: err.message,
    });
    return;
  }
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
}
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
}
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}
