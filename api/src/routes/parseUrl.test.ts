import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const SAMPLE_HTML = `
<!doctype html>
<html>
  <head>
    <title>Acme Corp</title>
    <meta name="description" content="We make widgets" />
  </head>
  <body>
    <h1>Welcome to Acme</h1>
    <p>Best widgets in the business.</p>
  </body>
</html>
`;

describe('POST /api/parse-url', () => {
  const app = createApp();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed signals from a fetched homepage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(SAMPLE_HTML, { status: 200 })),
    );
    const res = await request(app)
      .post('/api/parse-url')
      .send({ url: 'https://example.com' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Acme Corp');
    expect(res.body.metaDescription).toBe('We make widgets');
    expect(res.body.h1).toBe('Welcome to Acme');
    expect(res.body.bodySample).toContain('Welcome to Acme');
  });

  it('returns 400 with { error, code } for invalid URL', async () => {
    const res = await request(app)
      .post('/api/parse-url')
      .send({ url: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'invalid_url', code: 400 });
  });

  it('returns 400 for missing url body', async () => {
    const res = await request(app).post('/api/parse-url').send({});
    expect(res.status).toBe(400);
    expect(res.body.code).toBe(400);
  });

  it('returns 400 when fetch throws (unreachable)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    const res = await request(app)
      .post('/api/parse-url')
      .send({ url: 'https://nonexistent.example' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'unreachable', code: 400 });
  });

  it('returns 400 when fetched URL responds with non-2xx', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 500 })),
    );
    const res = await request(app)
      .post('/api/parse-url')
      .send({ url: 'https://example.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('fetch_failed_500');
  });
});
