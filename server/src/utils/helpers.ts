import type { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

export interface AuthRequest extends Request {
  userId?: string;
}

export const asyncHandler =
  (fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req as AuthRequest, res, next).catch(next);
  };

export const isValidObjectId = (id: string): boolean => Types.ObjectId.isValid(id);

export const toObjectId = (id: string): Types.ObjectId => new Types.ObjectId(id);