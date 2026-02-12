import { z } from 'zod';
import { UserType, OrderStatus } from '../types';
export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export const loginSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.nativeEnum(UserType),
});
export const createOrderSchema = z.object({
  origin: locationSchema,
  destination: locationSchema,
});
export const updateLocationSchema = locationSchema;
export const updateOrderLocationSchema = z.object({
  origin: locationSchema.optional(),
  destination: locationSchema.optional(),
});
export const markOrderStatusSchema = z.object({
  status: z.enum([OrderStatus.DELIVERED, OrderStatus.FAILED]),
});
export const markDroneStatusSchema = z.object({
  status: z.enum(['broken', 'fixed']),
});
export function validateBody(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      } else {
        next(error);
      }
    }
  };
}
