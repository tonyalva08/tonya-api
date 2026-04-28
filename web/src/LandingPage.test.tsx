import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import LandingPage from './LandingPage';

describe('LandingPage', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders URL input and sector dropdown', () => {
    render(<LandingPage onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/company url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sector/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get snapshot/i })).toBeInTheDocument();
  });

  it('shows error and blocks submit on invalid URL', () => {
    const onSubmit = vi.fn();
    render(<LandingPage onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/company url/i), {
      target: { value: 'not-a-url' },
    });
    fireEvent.click(screen.getByRole('button', { name: /get snapshot/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/valid http\(s\) url/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with form data on valid submit', () => {
    const onSubmit = vi.fn();
    render(<LandingPage onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/company url/i), {
      target: { value: 'https://example.com' },
    });
    fireEvent.change(screen.getByLabelText(/sector/i), {
      target: { value: 'Fintech' },
    });
    fireEvent.click(screen.getByRole('button', { name: /get snapshot/i }));
    expect(onSubmit).toHaveBeenCalledWith({
      url: 'https://example.com',
      sector: 'Fintech',
    });
  });
});
