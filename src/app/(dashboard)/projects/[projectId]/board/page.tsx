// src/app/(dashboard)/projects/[projectId]/board/page.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Priority = 'P1' | 'P2' | 'P3' | 'P4';
type Status = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

type Card = {
  id: string;
  title: string;
  labels: string[];
  priority: Priority;
  assignee?: string | null;
};

type Column = {
  id: string;
  name: string;
  order: number;
};

const demoColumns: Column[] = [
  { id: 'col_todo', name: 'To Do', order: 1 },
  { id: 'col_doing', name: 'In Progress', order: 2 },
  { id: 'col_review', name: 'Review', order: 3 },
  { id: 'col_done', name: 'Done', order: 4 },
];

const demoCards: Record<string, Card[]> = {
  ToDo: [
    {
      id: 'c1',
      title: 'Plan week milestones',
      labels: ['@planning'],
      priority: 'P3',
    },
    {
      id: 'c2',
      title: 'Instrumentation events',
      labels: ['@analytics'],
      priority: 'P2',
      assignee: 'You',
    },
  ],
  'In Progress': [
    {
      id: 'c3',
      title: 'Implement server actions',
      labels: ['@api'],
      priority: 'P1',
      assignee: 'Fahad',
    },
  ],
  Review: [
    {
      id: 'c4',
      title: 'Update color tokens',
      labels: ['@design'],
      priority: 'P2',
      assignee: 'Amira',
    },
  ],
  Done: [
    { id: 'c5', title: 'Docs sidebar IA', labels: ['@docs'], priority: 'P4' },
  ],
};

export default function ProjectBoardPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;

  const [columns] = useState<Column[]>(demoColumns);
  const [cards, setCards] = useState<Record<string, Card[]>>(demoCards as any);
  const [q, setQ] = useState('');

  const ordered = useMemo(
    () => [...columns].sort((a, b) => a.order - b.order),
    [columns],
  );

  const handleAdd = (colName: string) => {
    const title = prompt(`New card for "${colName}"`);
    if (!title) return;
    setCards((prev) => ({
      ...prev,
      [colName]: [
        { id: crypto.randomUUID(), title, labels: [], priority: 'P3' },
        ...(prev[colName] ?? []),
      ],
    }));
  };

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
              Project — {projectId}
            </h1>
            <p className="text-sm text-zinc-500">
              Board view. Drag & drop columns/cards (Wire up later).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              List view
            </Link>
            <Link
              href={`/projects/${projectId}/settings`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              Settings
            </Link>
          </div>
        </div>

        {/* Board */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/60 px-4 py-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search cards…"
              className="h-9 w-full max-w-sm rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
            />
            <button
              onClick={() => alert('TODO: enable drag & drop')}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              Enable DnD
            </button>
          </div>

          {/* Columns */}
          <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
            {ordered.map((col) => {
              const list = (cards[col.name] ?? []).filter((c) => {
                if (!q.trim()) return true;
                const t = q.toLowerCase();
                return (
                  c.title +
                  ' ' +
                  c.labels.join(' ') +
                  ' ' +
                  (c.assignee ?? '')
                )
                  .toLowerCase()
                  .includes(t);
              });

              return (
                <div
                  key={col.id}
                  className="flex flex-col rounded-xl border border-zinc-200 bg-white">
                  <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/60 px-3 py-2">
                    <span className="text-sm font-medium text-zinc-800">
                      {col.name.replace('ToDo', 'To Do')} · {list.length}
                    </span>
                    <button
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50"
                      onClick={() => handleAdd(col.name)}>
                      + Add
                    </button>
                  </div>

                  <ul className="flex min-h-[12rem] flex-col gap-2 p-3">
                    {list.map((c) => (
                      <li
                        key={c.id}
                        className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition hover:shadow-md"
                        title={c.title}>
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {c.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <span className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
                            {c.priority}
                          </span>
                          {c.labels.map((l) => (
                            <span
                              key={l}
                              className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
                              {l}
                            </span>
                          ))}
                          {c.assignee && (
                            <span className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
                              {c.assignee}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                    {list.length === 0 && (
                      <li className="rounded-lg border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
                        No cards yet.
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Hint: Add columns in Settings to match your workflow.
        </p>
      </section>
    </main>
  );
}
