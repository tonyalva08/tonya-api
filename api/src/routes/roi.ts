import { Router, Request, Response, NextFunction } from 'express';
import {
  validateBody,
  type ValidationResult,
  type ValidatedRequest,
} from '../middleware/validate';
import { generateROIProfile, ACTION_LABELS } from '../lib/roi';
import type { ActionId } from '../lib/stubs';
import type { Sector, MarketSnapshot, Stage } from '../lib/snapshot';

const VALID_SECTORS: readonly Sector[] = [
  'B2B SaaS',
  'CPG',
  'Climate Tech',
  'Health',
  'Fintech',
  'E-Commerce',
  'Media',
] as const;

const VALID_STAGES: readonly Stage[] = [
  'pre-PMF',
  'growth',
  'scaling',
  'mature',
] as const;

interface ROIBody {
  sector: Sector;
  actionId: ActionId;
  snapshot: MarketSnapshot;
}

function isValidSnapshot(value: unknown): value is MarketSnapshot {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as {
    stage?: unknown;
    competitors?: unknown;
    positioning?: unknown;
  };
  if (typeof s.stage !== 'string' || !VALID_STAGES.includes(s.stage as Stage)) {
    return false;
  }
  if (typeof s.positioning !== 'string') return false;
  if (!Array.isArray(s.competitors)) return false;
  return s.competitors.every((c) => {
    if (typeof c !== 'object' || c === null) return false;
    const comp = c as { name?: unknown; positioning?: unknown };
    return (
      typeof comp.name === 'string' && typeof comp.positioning === 'string'
    );
  });
}

function validateROIBody(body: unknown): ValidationResult<ROIBody> {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'invalid_body' };
  }
  const { sector, actionId, snapshot } = body as {
    sector?: unknown;
    actionId?: unknown;
    snapshot?: unknown;
  };
  if (
    typeof sector !== 'string' ||
    !VALID_SECTORS.includes(sector as Sector)
  ) {
    return { ok: false, error: 'invalid_sector' };
  }
  if (
    typeof actionId !== 'string' ||
    !(actionId in ACTION_LABELS)
  ) {
    return { ok: false, error: 'invalid_action' };
  }
  if (!isValidSnapshot(snapshot)) {
    return { ok: false, error: 'invalid_snapshot' };
  }
  return {
    ok: true,
    data: {
      sector: sector as Sector,
      actionId: actionId as ActionId,
      snapshot,
    },
  };
}

export const roiRouter = Router();

roiRouter.post(
  '/roi',
  validateBody(validateROIBody),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { sector, actionId, snapshot } = (
      req as ValidatedRequest<ROIBody>
    ).validatedBody;

    try {
      const profile = await generateROIProfile(sector, actionId, snapshot);
      res.json(profile);
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
