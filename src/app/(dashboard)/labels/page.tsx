// src/app/(dashboard)/labels/page.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Label = {
  id: string;
  name: string;
  color?: string; // Tailwind class or hex (we'll render safely)
  isSystem?: boolean;
  usageCount: number;
  createdAt: string; // ISO
};

const demoLabels: Label[] = [
  {
    id: 'lbl_waiting',
    name: '@waiting',
    color: 'bg-zinc-900',
    usageCount: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lbl_design',
    name: '@design',
    color: 'bg-zinc-700',
    usageCount: 7,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lbl_urgent',
    name: '@urgent',
    color: 'bg-black',
    usageCount: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lbl_writing',
    name: '@writing',
    color: 'bg-zinc-500',
    usageCount: 9,
    createdAt: new Date().toISOString(),
  },
];

const palette = [
  'bg-black',
  'bg-zinc-900',
  'bg-zinc-800',
  'bg-zinc-700',
  'bg-zinc-600',
  'bg-zinc-500',
  'bg-zinc-400',
];

export default function LabelsPage() {
  const [labels, setLabels] = useState<Label[]>(demoLabels);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'recent' | 'usage' | 'alpha'>('usage');

  // Create form
  const [draftName, setDraftName] = useState('');
  const [draftColor, setDraftColor] = useState<string>('bg-zinc-900');

  const filtered = useMemo(() => {
    let arr = [...labels];
    if (q.trim()) {
      const t = q.toLowerCase();
      arr = arr.filter((l) => l.name.toLowerCase().includes(t));
    }
    if (sort === 'usage') arr.sort((a, b) => b.usageCount - a.usageCount);
    if (sort === 'alpha') arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'recent')
      arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return arr;
  }, [labels, q, sort]);

  function createLabel() {
    const name = draftName.trim();
    if (!name) return;
    if (labels.some((l) => l.name.toLowerCase() === name.toLowerCase())) {
      alert('Label already exists.');
      return;
    }
    const newLabel: Label = {
      id: crypto.randomUUID(),
      name,
      color: draftColor,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    setLabels((x) => [newLabel, ...x]);
    setDraftName('');
  }

  function renameLabel(id: string, nextName: string) {
    setLabels((xs) =>
      xs.map((l) =>
        l.id === id ? { ...l, name: nextName.trim() || l.name } : l,
      ),
    );
  }

  function recolorLabel(id: string, nextColor: string) {
    setLabels((xs) =>
      xs.map((l) => (l.id === id ? { ...l, color: nextColor } : l)),
    );
  }

  function deleteLabel(id: string) {
    if (!confirm('Delete this label? Tasks will remain but lose this label.'))
      return;
    setLabels((xs) => xs.filter((l) => l.id !== id));
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      {/* Background accent */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-x-0 top-[-10rem] mx-auto h-[24rem] w-[36rem] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 40%, rgba(24,24,27,0.10), rgba(24,24,27,0))',
          }}
        />
      </div>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
              Labels
            </h1>
            <p className="text-sm text-zinc-500">
              Categorize tasks across projects for faster focus and filtering.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search labels…"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:max-w-sm"
              />
              <select
                className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}>
                <option value="usage">Sort: Usage</option>
                <option value="recent">Sort: Recent</option>
                <option value="alpha">Sort: A–Z</option>
              </select>
            </div>

            {/* Create new label */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1">
                  {palette.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDraftColor(c)}
                      className={`h-5 w-5 rounded ${c} ${
                        draftColor === c ? 'ring-2 ring-zinc-900/50' : ''
                      }`}
                      aria-label={c}
                      title={c}
                    />
                  ))}
                </div>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createLabel()}
                  placeholder="New label (e.g., @planning)"
                  className="h-9 w-48 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>
              <button
                onClick={createLabel}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
                + Create
              </button>
            </div>
          </div>

          {/* List */}
          <ul className="divide-y divide-zinc-100">
            {filtered.map((l) => (
              <li
                key={l.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`h-3 w-3 rounded ${l.color ?? 'bg-zinc-400'}`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/labels/${l.id}`}
                        className="truncate text-sm font-medium text-zinc-950 underline underline-offset-4 hover:opacity-90"
                        title={l.name}>
                        {l.name}
                      </Link>
                      {l.isSystem && (
                        <span className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
                          System
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] text-zinc-500">
                      Used in{' '}
                      <span className="font-medium text-zinc-700">
                        {l.usageCount}
                      </span>{' '}
                      task
                      {l.usageCount === 1 ? '' : 's'} · Created{' '}
                      {new Date(l.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {/* Quick rename */}
                  <details className="relative">
                    <summary className="flex h-9 cursor-pointer list-none items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
                      Rename
                    </summary>
                    <div className="absolute right-0 z-10 mt-2 flex min-w-[14rem] items-center gap-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
                      <input
                        defaultValue={l.name}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            renameLabel(
                              l.id,
                              (e.target as HTMLInputElement).value,
                            );
                            (
                              e.currentTarget.parentElement
                                ?.parentElement as HTMLDetailsElement
                            ).open = false;
                          }
                        }}
                        className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                      />
                      <button
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50"
                        onClick={(e) => {
                          const input =
                            (e.currentTarget.parentElement?.querySelector(
                              'input',
                            ) ?? null) as HTMLInputElement | null;
                          if (input) renameLabel(l.id, input.value);
                          (
                            e.currentTarget.parentElement
                              ?.parentElement as HTMLDetailsElement
                          ).open = false;
                        }}>
                        Save
                      </button>
                    </div>
                  </details>

                  {/* Recolor */}
                  <details className="relative">
                    <summary className="flex h-9 cursor-pointer list-none items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
                      Color
                    </summary>
                    <div className="absolute right-0 z-10 mt-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
                      <div className="flex items-center gap-1">
                        {palette.map((c) => (
                          <button
                            key={c}
                            onClick={() => recolorLabel(l.id, c)}
                            className={`h-5 w-5 rounded ${c} ${
                              l.color === c ? 'ring-2 ring-zinc-900/50' : ''
                            }`}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </details>

                  <button
                    onClick={() => deleteLabel(l.id)}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50">
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-12 text-center text-sm text-zinc-500">
                No labels found.
              </li>
            )}
          </ul>
        </div>

        {/* Microcopy */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          Tip: Use labels like{' '}
          <code className="rounded bg-white px-1">@waiting</code> or{' '}
          <code className="rounded bg-white px-1">@p1</code> to create powerful
          filters across projects.
        </p>
      </section>
    </main>
  );
}
