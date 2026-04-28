import { ErrorRequestHandler } from 'express';

interface AppError {
  code?: number;
  error?: string;
  message?: string;
}

export const errorMiddleware: ErrorRequestHandler = (err: AppError, _req, res, _next) => {
  const code = typeof err?.code === 'number' ? err.code : 500;
  const error = typeof err?.error === 'string' ? err.error : err?.message || 'internal_error';
  res.status(code).json({ error, code });
};
