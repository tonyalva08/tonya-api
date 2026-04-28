import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import SnapshotPage from './SnapshotPage';
import type { MarketSnapshot } from './types';

const SAMPLE_SNAPSHOT: MarketSnapshot = {
  stage: 'growth',
  competitors: [
    { name: 'Linear', positioning: 'Issue tracker for engineering teams' },
    { name: 'Jira', positioning: 'Enterprise issue tracker' },
    { name: 'Asana', positioning: 'Cross-functional work management' },
  ],
  positioning: 'A developer-first issue tracker positioned against Jira.',
};

describe('SnapshotPage', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  function mockFetchOk(data: MarketSnapshot) {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(data),
        }),
      ),
    );
  }

  it('shows loading state initially', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => undefined)));
    render(
      <SnapshotPage
        formData={{ url: 'https://example.com', sector: 'B2B SaaS' }}
        onActionSelected={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    expect(screen.getByText(/loading market snapshot/i)).toBeInTheDocument();
  });

  it('renders snapshot details when fetch succeeds', async () => {
    mockFetchOk(SAMPLE_SNAPSHOT);
    render(
      <SnapshotPage
        formData={{ url: 'https://example.com', sector: 'B2B SaaS' }}
        onActionSelected={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    await waitFor(() =>
      expect(screen.getByText(/developer-first/i)).toBeInTheDocument(),
    );
    expect(screen.getByText('growth')).toBeInTheDocument();
    expect(screen.getByText('Linear')).toBeInTheDocument();
    expect(screen.getByText('Jira')).toBeInTheDocument();
  });

  it('renders all 8 design action cards when snapshot is ready', async () => {
    mockFetchOk(SAMPLE_SNAPSHOT);
    render(
      <SnapshotPage
        formData={{ url: 'https://example.com', sector: 'B2B SaaS' }}
        onActionSelected={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /rebrand/i })).toBeInTheDocument(),
    );
    const actionsRegion = screen.getByRole('region', { name: /design actions/i });
    const buttons = actionsRegion.querySelectorAll('button');
    expect(buttons).toHaveLength(8);
  });

  it('calls onActionSelected with action and snapshot when an action is clicked', async () => {
    mockFetchOk(SAMPLE_SNAPSHOT);
    const onActionSelected = vi.fn();
    render(
      <SnapshotPage
        formData={{ url: 'https://example.com', sector: 'B2B SaaS' }}
        onActionSelected={onActionSelected}
        onBack={vi.fn()}
      />,
    );
    const rebrandButton = await screen.findByRole('button', {
      name: /rebrand/i,
    });
    fireEvent.click(rebrandButton);
    expect(onActionSelected).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'rebrand' }),
      SAMPLE_SNAPSHOT,
    );
  });

  it('shows error state when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'server_error' }),
        }),
      ),
    );
    render(
      <SnapshotPage
        formData={{ url: 'https://example.com', sector: 'B2B SaaS' }}
        onActionSelected={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/server_error/);
  });
});
