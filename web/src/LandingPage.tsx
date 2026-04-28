import { FormEvent, useState } from 'react';
import { SECTORS, type Sector } from './sectors';

export type LandingFormData = { url: string; sector: Sector };

type Props = {
  onSubmit: (data: LandingFormData) => void;
};

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function LandingPage({ onSubmit }: Props) {
  const [url, setUrl] = useState('');
  const [sector, setSector] = useState<Sector>(SECTORS[0]);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!isValidHttpUrl(url)) {
      setError('Enter a valid http(s) URL');
      return;
    }
    onSubmit({ url, sector });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form
        className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm"
        onSubmit={handleSubmit}
        noValidate
      >
        <h1 className="text-3xl font-semibold text-slate-900">Tonya</h1>
        <p className="mt-2 text-slate-600">Design investment simulator</p>

        <label className="block mt-6 text-sm font-medium text-slate-700">
          Company URL
          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-label="Company URL"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </label>

        <label className="block mt-4 text-sm font-medium text-slate-700">
          Sector
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value as Sector)}
            aria-label="Sector"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-md bg-slate-900 px-4 py-2.5 text-white font-medium hover:bg-slate-800 transition-colors"
        >
          Get snapshot
        </button>
      </form>
    </main>
  );
}
