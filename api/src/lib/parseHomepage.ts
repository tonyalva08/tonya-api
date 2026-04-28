import * as cheerio from 'cheerio';

export interface ParsedHomepage {
  title: string;
  metaDescription: string;
  h1: string;
  bodySample: string;
}

export type ParseHomepageResult =
  | { ok: true; data: ParsedHomepage }
  | { ok: false; error: string; code: number };

const FETCH_TIMEOUT_MS = 8000;
const BODY_SAMPLE_LIMIT = 1000;

export async function parseHomepage(url: string): Promise<ParseHomepageResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'TonyaBot/1.0' },
      redirect: 'follow',
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `fetch_failed_${response.status}`,
        code: 400,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    return {
      ok: true,
      data: {
        title: $('title').first().text().trim(),
        metaDescription:
          $('meta[name="description"]').attr('content')?.trim() ?? '',
        h1: $('h1').first().text().trim(),
        bodySample: $('body')
          .text()
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, BODY_SAMPLE_LIMIT),
      },
    };
  } catch {
    return { ok: false, error: 'unreachable', code: 400 };
  } finally {
    clearTimeout(timeoutId);
  }
}
