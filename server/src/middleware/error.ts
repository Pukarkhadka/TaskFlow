import { Request, Response, NextFunction } from "express";
import { Error } from "mongoose";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({ message: messages.join(", ") });
    return;
  }

  if (err instanceof Error.CastError) {
    res.status(400).json({ message: "Invalid id format" });
    return;
  }

  if (isDuplicateKeyError(err)) {
    res.status(409).json({ message: "An account with that email already exists" });
    return;
  }

  res.status(500).json({ message: "Server error" });
};

const isDuplicateKeyError = (err: unknown): boolean => {
  if (err && typeof err === "object" && "code" in err) {
    return (err as { code: number }).code === 11000;
  }
  return false;
};