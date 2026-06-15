import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/jwt.js";

export interface AuthedUser {
  userId: string;
  role: "admin" | "teacher" | "student";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Не авторизован" });
  }
  try {
    const payload = verifyToken(header.slice(7));
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Недействительный токен" });
  }
}

export function requireRole(...roles: AuthedUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Не авторизован" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Доступ запрещён" });
    }
    next();
  };
}
