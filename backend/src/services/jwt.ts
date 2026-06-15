import jwt from "jsonwebtoken";
import { config } from "../config.js";

export interface JwtPayload {
  userId: string;
  role: "admin" | "teacher" | "student";
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
