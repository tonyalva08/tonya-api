import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('../lib/parseHomepage', () => ({
  parseHomepage: vi.fn(),
}));
vi.mock('../lib/snapshot', () => ({
  generateMarketSnapshot: vi.fn(),
}));

import { createApp } from '../app';
import { parseHomepage } from '../lib/parseHomepage';
import { generateMarketSnapshot } from '../lib/snapshot';

describe('POST /api/snapshot', () => {
  const app = createApp();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the structured market snapshot for a valid input', async () => {
    vi.mocked(parseHomepage).mockResolvedValue({
      ok: true,
      data: {
        title: 'Acme',
        metaDescription: 'We make widgets',
        h1: 'Welcome',
        bodySample: 'lorem',
      },
    });
    vi.mocked(generateMarketSnapshot).mockResolvedValue({
      stage: 'growth',
      competitors: [
        { name: 'Competitor A', positioning: 'Incumbent in widgets' },
        { name: 'Competitor B', positioning: 'Challenger brand' },
        { name: 'Competitor C', positioning: 'Emerging entrant' },
      ],
      positioning: 'Acme is a widget maker positioned against incumbents.',
    });

    const res = await request(app)
      .post('/api/snapshot')
      .send({ url: 'https://example.com', sector: 'B2B SaaS' });

    expect(res.status).toBe(200);
    expect(res.body.stage).toBe('growth');
    expect(res.body.competitors).toHaveLength(3);
    expect(res.body.positioning).toContain('Acme');
  });

  it('returns 400 with { error, code } for invalid sector', async () => {
    const res = await request(app)
      .post('/api/snapshot')
      .send({ url: 'https://example.com', sector: 'NotASector' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'invalid_sector', code: 400 });
  });

  it('returns 400 for invalid URL', async () => {
    const res = await request(app)
      .post('/api/snapshot')
      .send({ url: 'not-a-url', sector: 'B2B SaaS' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_url');
  });

  it('propagates parseHomepage failures with the original code', async () => {
    vi.mocked(parseHomepage).mockResolvedValue({
      ok: false,
      error: 'unreachable',
      code: 400,
    });
    const res = await request(app)
      .post('/api/snapshot')
      .send({ url: 'https://nonexistent.example', sector: 'B2B SaaS' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'unreachable', code: 400 });
  });

  it('returns 504 when Claude call times out', async () => {
    vi.mocked(parseHomepage).mockResolvedValue({
      ok: true,
      data: { title: 'X', metaDescription: '', h1: '', bodySample: '' },
    });
    vi.mocked(generateMarketSnapshot).mockRejectedValue(
      new Error('Request timeout'),
    );
    const res = await request(app)
      .post('/api/snapshot')
      .send({ url: 'https://example.com', sector: 'B2B SaaS' });
    expect(res.status).toBe(504);
    expect(res.body).toEqual({ error: 'claude_timeout', code: 504 });
  });

  it('passes the declared sector through to the snapshot generator', async () => {
    vi.mocked(parseHomepage).mockResolvedValue({
      ok: true,
      data: { title: 'X', metaDescription: '', h1: '', bodySample: '' },
    });
    vi.mocked(generateMarketSnapshot).mockResolvedValue({
      stage: 'growth',
      competitors: [
        { name: 'A', positioning: 'a' },
        { name: 'B', positioning: 'b' },
        { name: 'C', positioning: 'c' },
      ],
      positioning: 'placeholder',
    });

    await request(app)
      .post('/api/snapshot')
      .send({ url: 'https://example.com', sector: 'Fintech' });

    expect(generateMarketSnapshot).toHaveBeenLastCalledWith(
      expect.any(Object),
      'Fintech',
    );
  });
});
