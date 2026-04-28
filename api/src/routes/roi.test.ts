import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('../lib/roi', async () => {
  const actual =
    await vi.importActual<typeof import('../lib/roi')>('../lib/roi');
  return {
    ...actual,
    generateROIProfile: vi.fn(),
  };
});

import { createApp } from '../app';
import { generateROIProfile } from '../lib/roi';
import type { MarketSnapshot } from '../lib/snapshot';

const SAMPLE_SNAPSHOT: MarketSnapshot = {
  stage: 'growth',
  competitors: [
    { name: 'Linear', positioning: 'Issue tracker' },
    { name: 'Notion', positioning: 'Workspace' },
    { name: 'Asana', positioning: 'Work mgmt' },
  ],
  positioning: 'A B2B SaaS company.',
};

describe('POST /api/roi', () => {
  const app = createApp();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the structured ROI profile for a valid input', async () => {
    vi.mocked(generateROIProfile).mockResolvedValue({
      projectionRange: { low: 8, mid: 15, high: 25, unit: 'percent_lift' },
      caseStudy: {
        company: 'Linear',
        outcome: '4x ARR ramp',
        source: 'Linear blog',
      },
      shortTermImpact: 'Conversion uplift',
      longTermImpact: 'Lower churn',
      confidence: 'high',
    });

    const res = await request(app).post('/api/roi').send({
      sector: 'B2B SaaS',
      actionId: 'ux-redesign',
      snapshot: SAMPLE_SNAPSHOT,
    });

    expect(res.status).toBe(200);
    expect(res.body.projectionRange.mid).toBe(15);
    expect(res.body.caseStudy.company).toBe('Linear');
    expect(res.body.confidence).toBe('high');
  });

  it('returns 400 with { error, code } for invalid sector', async () => {
    const res = await request(app).post('/api/roi').send({
      sector: 'NotASector',
      actionId: 'rebrand',
      snapshot: SAMPLE_SNAPSHOT,
    });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'invalid_sector', code: 400 });
  });

  it('returns 400 for invalid actionId', async () => {
    const res = await request(app).post('/api/roi').send({
      sector: 'B2B SaaS',
      actionId: 'time-machine',
      snapshot: SAMPLE_SNAPSHOT,
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_action');
  });

  it('returns 400 for invalid snapshot shape', async () => {
    const res = await request(app)
      .post('/api/roi')
      .send({
        sector: 'B2B SaaS',
        actionId: 'rebrand',
        snapshot: { stage: 'unknown', competitors: [], positioning: 'x' },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_snapshot');
  });

  it('returns 504 when Claude call times out', async () => {
    vi.mocked(generateROIProfile).mockRejectedValue(
      new Error('Request timeout'),
    );
    const res = await request(app).post('/api/roi').send({
      sector: 'B2B SaaS',
      actionId: 'rebrand',
      snapshot: SAMPLE_SNAPSHOT,
    });
    expect(res.status).toBe(504);
    expect(res.body).toEqual({ error: 'claude_timeout', code: 504 });
  });

  it('passes sector and action through to the ROI generator', async () => {
    vi.mocked(generateROIProfile).mockResolvedValue({
      projectionRange: { low: 1, mid: 2, high: 3, unit: 'percent_lift' },
      caseStudy: { company: 'X', outcome: 'y', source: 'z' },
      shortTermImpact: 'a',
      longTermImpact: 'b',
      confidence: 'low',
    });

    await request(app).post('/api/roi').send({
      sector: 'Fintech',
      actionId: 'rebrand',
      snapshot: SAMPLE_SNAPSHOT,
    });

    expect(generateROIProfile).toHaveBeenLastCalledWith(
      'Fintech',
      'rebrand',
      expect.any(Object),
    );
  });
});
