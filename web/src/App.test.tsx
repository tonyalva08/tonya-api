import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the landing page initially', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Tonya' })).toBeInTheDocument();
    expect(screen.getByLabelText(/company url/i)).toBeInTheDocument();
  });

  it('routes to snapshot screen after a valid form submit', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => undefined)),
    );
    render(<App />);
    fireEvent.change(screen.getByLabelText(/company url/i), {
      target: { value: 'https://example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /get snapshot/i }));
    expect(
      screen.getByRole('heading', { name: /market snapshot/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/example\.com/)).toBeInTheDocument();
  });
});
