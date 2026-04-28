import { useEffect, useState } from 'react';
import type { LandingFormData } from './LandingPage';
import { ACTIONS, type Action } from './actions';
import type { MarketSnapshot } from './types';

type SnapshotState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: MarketSnapshot };

type Props = {
  formData: LandingFormData;
  onActionSelected: (action: Action, snapshot: MarketSnapshot) => void;
  onBack: () => void;
};

export default function SnapshotPage({
  formData,
  onActionSelected,
  onBack,
}: Props) {
  const [state, setState] = useState<SnapshotState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) {
          const body: { error?: string } = await r.json().catch(() => ({}));
          throw new Error(body.error ?? `request failed (${r.status})`);
        }
        return (await r.json()) as MarketSnapshot;
      })
      .then((data) => setState({ status: 'ready', data }))
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'unknown error';
        setState({ status: 'error', message });
      });

    return () => controller.abort();
  }, [formData]);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← back
        </button>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">
          Market snapshot
        </h2>
        <p className="mt-1 text-slate-600">
          {formData.url} · {formData.sector}
        </p>

        {state.status === 'loading' && (
          <div className="mt-6 rounded-2xl bg-white shadow-sm p-6">
            <p className="text-slate-600">Loading market snapshot...</p>
          </div>
        )}

        {state.status === 'error' && (
          <div className="mt-6 rounded-2xl bg-white shadow-sm p-6">
            <p role="alert" className="text-red-600">
              Error: {state.message}
            </p>
          </div>
        )}

        {state.status === 'ready' && (
          <>
            <SnapshotCard data={state.data} />
            <ActionMenu
              onSelect={(action) => onActionSelected(action, state.data)}
            />
          </>
        )}
      </div>
    </main>
  );
}

function SnapshotCard({ data }: { data: MarketSnapshot }) {
  return (
    <div className="mt-6 rounded-2xl bg-white shadow-sm p-6">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Stage
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-medium">
          {data.stage}
        </span>
      </div>
      <p className="mt-4 text-slate-900 leading-relaxed">{data.positioning}</p>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-slate-700">Competitors</h3>
        <ul className="mt-2 space-y-2">
          {data.competitors.map((c) => (
            <li
              key={c.name}
              className="rounded-lg border border-slate-200 px-3 py-2"
            >
              <span className="font-medium text-slate-900">{c.name}</span>
              <span className="ml-2 text-sm text-slate-600">
                {c.positioning}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ActionMenu({ onSelect }: { onSelect: (action: Action) => void }) {
  return (
    <section aria-label="Design actions" className="mt-8">
      <h3 className="text-lg font-semibold text-slate-900">
        Pick a design action to model
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        We&apos;ll project ROI for the action you select.
      </p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onSelect(action)}
            className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-900 hover:shadow-sm transition"
          >
            <div className="font-medium text-slate-900">{action.label}</div>
            <div className="mt-1 text-sm text-slate-600">
              {action.description}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
