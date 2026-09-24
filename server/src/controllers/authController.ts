import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest, asyncHandler } from "../utils/helpers";

const signToken = (id: string, name: string): { token: string; user: { id: string; name: string; email: string } } => {
  const secret = process.env.JWT_SECRET || "dev-secret";
  const token = jwt.sign({ id }, secret, { expiresIn: "7d" });
  return { token, user: { id, name, email: "" } };
};

const cleanUser = (u: { _id: string; name: string; email: string }) => ({
  id: u._id.toString(),
  name: u.name,
  email: u.email,
});

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "Name, email and password are required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters" });
    return;
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409).json({ message: "An account with that email already exists" });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  const { token, user: jwtUser } = signToken(user._id.toString(), user.name);
  res.status(201).json({ token, user: { ...jwtUser, email: user.email } });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const { token, user: jwtUser } = signToken(user._id.toString(), user.name);
  res.json({ token, user: { ...jwtUser, email: user.email } });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ user: cleanUser(user as unknown as { _id: string; name: string; email: string }) });
});