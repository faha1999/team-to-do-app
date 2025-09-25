// src/app/(dashboard)/filters/_FiltersClient.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type SavedFilter = {
  id: string;
  name: string;
  shared: boolean;
  owner: { id: string; name: string };
  queryJSON: Record<string, unknown>;
  updatedAt: string;
};

export default function FiltersClient({
  initialFilters,
}: {
  initialFilters: SavedFilter[];
}) {
  const [q, setQ] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [onlyShared, setOnlyShared] = useState(false);
  const [sort, setSort] = useState<'recent' | 'alpha'>('recent');

  const data = useMemo(() => {
    let arr = [...initialFilters];
    if (q.trim()) {
      const term = q.toLowerCase();
      arr = arr.filter(
        (f) =>
          f.name.toLowerCase().includes(term) ||
          JSON.stringify(f.queryJSON).toLowerCase().includes(term) ||
          f.owner.name.toLowerCase().includes(term),
      );
    }
    if (onlyMine) arr = arr.filter((f) => f.owner.name === 'You');
    if (onlyShared) arr = arr.filter((f) => f.shared);

    if (sort === 'alpha') {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      arr.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    }
    return arr;
  }, [initialFilters, q, onlyMine, onlyShared, sort]);

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <input
            placeholder="Search saved filters…"
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:max-w-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}>
            <option value="recent">Sort: Recent</option>
            <option value="alpha">Sort: A–Z</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              checked={onlyMine}
              onChange={(e) => setOnlyMine(e.target.checked)}
            />
            Mine
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              checked={onlyShared}
              onChange={(e) => setOnlyShared(e.target.checked)}
            />
            Shared
          </label>
        </div>
      </div>

      {/* List */}
      <ul className="divide-y divide-zinc-100">
        {data.map((f) => (
          <li
            key={f.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/ (dashboard)/filters/${f.id}`.replace(' ', '')}
                  className="truncate text-sm font-medium text-zinc-950 underline underline-offset-4 hover:opacity-90"
                  title={f.name}>
                  {f.name}
                </Link>
                {f.shared ? (
                  <span className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
                    Shared
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
                    Private
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-[12px] text-zinc-600">
                {JSON.stringify(f.queryJSON)}
              </p>
              <p className="mt-1 text-[11px] text-zinc-400">
                Owner: {f.owner.name} · Updated{' '}
                {new Date(f.updatedAt).toLocaleString()}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/ (dashboard)/filters/${f.id}`.replace(' ', '')}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
                Open
              </Link>
              <a
                href={`/ (dashboard)/filters/${f.id}/edit`.replace(' ', '')}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
                Edit
              </a>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                onClick={() => alert(`TODO: delete filter ${f.name}`)}>
                Delete
              </button>
            </div>
          </li>
        ))}
        {data.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-zinc-500">
            No saved filters match your search.
          </li>
        )}
      </ul>
    </>
  );
}
