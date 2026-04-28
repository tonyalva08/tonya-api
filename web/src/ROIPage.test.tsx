import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import ROIPage from './ROIPage';
import { ACTIONS } from './actions';
import type { MarketSnapshot } from './types';

const SAMPLE_SNAPSHOT: MarketSnapshot = {
  stage: 'growth',
  competitors: [
    { name: 'A', positioning: 'a' },
    { name: 'B', positioning: 'b' },
    { name: 'C', positioning: 'c' },
  ],
  positioning: 'placeholder',
};

const SAMPLE_FORM = { url: 'https://example.com', sector: 'B2B SaaS' as const };

describe('ROIPage', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the action label and source URL', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => undefined)));
    render(
      <ROIPage
        formData={SAMPLE_FORM}
        action={ACTIONS[0]}
        snapshot={SAMPLE_SNAPSHOT}
        onBack={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('heading', { name: /ROI projection/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/example\.com/)).toBeInTheDocument();
  });

  it('shows loading state while fetching', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => undefined)));
    render(
      <ROIPage
        formData={SAMPLE_FORM}
        action={ACTIONS[0]}
        snapshot={SAMPLE_SNAPSHOT}
        onBack={vi.fn()}
      />,
    );
    expect(screen.getByText(/modeling roi/i)).toBeInTheDocument();
  });

  it('renders error state when fetch fails (e.g. /api/roi not yet implemented)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({}),
        }),
      ),
    );
    render(
      <ROIPage
        formData={SAMPLE_FORM}
        action={ACTIONS[0]}
        snapshot={SAMPLE_SNAPSHOT}
        onBack={vi.fn()}
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
