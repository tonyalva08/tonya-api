import { Router, Request, Response } from 'express';
import {
  validateBody,
  isValidHttpUrl,
  type ValidationResult,
  type ValidatedRequest,
} from '../middleware/validate';
import { parseHomepage } from '../lib/parseHomepage';

interface ParseUrlBody {
  url: string;
}

function validateParseUrlBody(body: unknown): ValidationResult<ParseUrlBody> {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'invalid_body' };
  }
  const url = (body as { url?: unknown }).url;
  if (!isValidHttpUrl(url)) {
    return { ok: false, error: 'invalid_url' };
  }
  return { ok: true, data: { url } };
}

export const parseUrlRouter = Router();

parseUrlRouter.post(
  '/parse-url',
  validateBody(validateParseUrlBody),
  async (req: Request, res: Response): Promise<void> => {
    const { url } = (req as ValidatedRequest<ParseUrlBody>).validatedBody;
    const result = await parseHomepage(url);
    if (!result.ok) {
      res.status(result.code).json({ error: result.error, code: result.code });
      return;
    }
    res.json(result.data);
  },
);
