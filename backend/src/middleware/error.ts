import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: "Не найдено" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: "Ошибка валидации", details: err.flatten() });
  }
  const e = err as Error & { status?: number };
  console.error("[error]", e.message);
  res.status(e.status ?? 500).json({ message: e.message ?? "Внутренняя ошибка" });
}
