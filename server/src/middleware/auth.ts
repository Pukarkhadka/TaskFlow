import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../utils/helpers";

interface JwtPayload {
  id: string;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authorized, no token provided" });
    return;
  }

  const token = header.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
};