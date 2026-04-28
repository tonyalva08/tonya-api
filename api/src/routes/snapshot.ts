import { Router, Request, Response, NextFunction } from 'express';
import {
  validateBody,
  isValidHttpUrl,
  type ValidationResult,
  type ValidatedRequest,
} from '../middleware/validate';
import { parseHomepage } from '../lib/parseHomepage';
import { generateMarketSnapshot, type Sector } from '../lib/snapshot';

const VALID_SECTORS: readonly Sector[] = [
  'B2B SaaS',
  'CPG',
  'Climate Tech',
  'Health',
  'Fintech',
  'E-Commerce',
  'Media',
] as const;

interface SnapshotBody {
  url: string;
  sector: Sector;
}

function validateSnapshotBody(body: unknown): ValidationResult<SnapshotBody> {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'invalid_body' };
  }
  const { url, sector } = body as { url?: unknown; sector?: unknown };
  if (!isValidHttpUrl(url)) {
    return { ok: false, error: 'invalid_url' };
  }
  if (
    typeof sector !== 'string' ||
    !VALID_SECTORS.includes(sector as Sector)
  ) {
    return { ok: false, error: 'invalid_sector' };
  }
  return { ok: true, data: { url, sector: sector as Sector } };
}

export const snapshotRouter = Router();

snapshotRouter.post(
  '/snapshot',
  validateBody(validateSnapshotBody),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { url, sector } = (req as ValidatedRequest<SnapshotBody>)
      .validatedBody;

    const parsed = await parseHomepage(url);
    if (!parsed.ok) {
      res.status(parsed.code).json({ error: parsed.error, code: parsed.code });
      return;
    }

    try {
      const snapshot = await generateMarketSnapshot(parsed.data, sector);
      res.json(snapshot);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      if (message.toLowerCase().includes('timeout')) {
        res.status(504).json({ error: 'claude_timeout', code: 504 });
        return;
      }
      next(err);
    }
  },
);
