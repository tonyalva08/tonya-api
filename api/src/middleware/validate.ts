import { Request, Response, NextFunction } from 'express';

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface ValidatedRequest<T> extends Request {
  validatedBody: T;
}

export function validateBody<T>(
  validator: (body: unknown) => ValidationResult<T>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validator(req.body);
    if (!result.ok) {
      res.status(400).json({ error: result.error, code: 400 });
      return;
    }
    (req as ValidatedRequest<T>).validatedBody = result.data;
    next();
  };
}

export function isValidHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
