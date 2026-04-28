import { useEffect, useState } from 'react';
import type { LandingFormData } from './LandingPage';
import type { Action } from './actions';
import type { MarketSnapshot } from './types';

type ROIState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: unknown };

type Props = {
  formData: LandingFormData;
  action: Action;
  snapshot: MarketSnapshot;
  onBack: () => void;
};

export default function ROIPage({ formData, action, snapshot, onBack }: Props) {
  const [state, setState] = useState<ROIState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/roi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: formData.url,
        sector: formData.sector,
        actionId: action.id,
        snapshot,
      }),
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) {
          const body: { error?: string } = await r.json().catch(() => ({}));
          throw new Error(body.error ?? `request failed (${r.status})`);
        }
        return (await r.json()) as unknown;
      })
      .then((data) => setState({ status: 'ready', data }))
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'unknown error';
        setState({ status: 'error', message });
      });

    return () => controller.abort();
  }, [formData, action, snapshot]);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← back to actions
        </button>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">
          ROI projection · {action.label}
        </h2>
        <p className="mt-1 text-slate-600">
          {formData.url} · {formData.sector}
        </p>

        <div className="mt-6 rounded-2xl bg-white shadow-sm p-6">
          {state.status === 'loading' && (
            <p className="text-slate-600">Modeling ROI...</p>
          )}
          {state.status === 'error' && (
            <p role="alert" className="text-red-600">
              Error: {state.message}
            </p>
          )}
          {state.status === 'ready' && (
            <pre className="text-xs text-slate-700 whitespace-pre-wrap">
              {JSON.stringify(state.data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}
