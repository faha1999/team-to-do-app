// src/app/(dashboard)/labels/[id]/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Priority = 'P1' | 'P2' | 'P3' | 'P4';
type Status = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

type Label = {
  id: string;
  name: string;
  color?: string;
  isSystem?: boolean;
  createdAt: string;
};

type Task = {
  id: string;
  title: string;
  project: string;
  priority: Priority;
  status: Status;
  dueDate?: string; // ISO yyyy-mm-dd
  labels: string[]; // label ids or names; demo uses names for readability
};

// --- Demo fetchers (replace with DB) ---
async function fetchLabel(id: string): Promise<Label | null> {
  const sample: Label[] = [
    {
      id: 'lbl_waiting',
      name: '@waiting',
      color: 'bg-zinc-900',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'lbl_design',
      name: '@design',
      color: 'bg-zinc-700',
      createdAt: new Date().toISOString(),
    },
  ];
  return sample.find((l) => l.id === id) ?? null;
}

async function fetchTasksForLabel(labelName: string): Promise<Task[]> {
  const today = new Date().toISOString().slice(0, 10);
  return [
    {
      id: 't1',
      title: 'Prepare client demo',
      project: 'CX',
      priority: 'P1',
      status: 'OPEN',
      dueDate: today,
      labels: ['@waiting', '@design'],
    },
    {
      id: 't2',
      title: 'Retro notes',
      project: 'Ops',
      priority: 'P2',
      status: 'OPEN',
      dueDate: undefined,
      labels: ['@waiting'],
    },
    {
      id: 't3',
      title: 'Spec typography tokens',
      project: 'UI',
      priority: 'P3',
      status: 'IN_PROGRESS',
      dueDate: today,
      labels: ['@design'],
    },
    {
      id: 't4',
      title: 'QA checklist',
      project: 'UI',
      priority: 'P2',
      status: 'OPEN',
      dueDate: undefined,
      labels: ['@waiting'],
    },
  ].filter((t) => t.labels.includes(labelName));
}

export default function LabelDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const [label, setLabel] = useState<Label | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<Status | 'ALL'>('ALL');
  const [priority, setPriority] = useState<Priority | 'ALL'>('ALL');
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const l = await fetchLabel(id);
      setLabel(l);
      if (l) {
        const ts = await fetchTasksForLabel(l.name);
        setTasks(ts);
      }
      setLoading(false);
    })();
  }, [id]);

  const results = useMemo(() => {
    let arr = [...tasks];
    if (status !== 'ALL') arr = arr.filter((t) => t.status === status);
    if (priority !== 'ALL') arr = arr.filter((t) => t.priority === priority);
    if (q.trim()) {
      const term = q.toLowerCase();
      arr = arr.filter((t) =>
        `${t.title} ${t.project}`.toLowerCase().includes(term),
      );
    }
    // group by project then due date bucket
    return arr;
  }, [tasks, status, priority, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of results) {
      const bucket = `${t.project} • ${t.dueDate ?? 'No due'}`;
      if (!map.has(bucket)) map.set(bucket, []);
      map.get(bucket)!.push(t);
    }
    return Array.from(map.entries());
  }, [results]);

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
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded ${label?.color ?? 'bg-zinc-400'}`}
              />
              <h1 className="truncate text-xl font-semibold tracking-tight text-zinc-950">
                {label ? label.name : 'Label'}
              </h1>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {label
                ? `Created ${new Date(label.createdAt).toLocaleDateString()}`
                : 'Loading…'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/labels"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              ← All labels
            </Link>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50"
              onClick={() => alert('TODO: copy link')}>
              Share
            </button>
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
                placeholder="Search tasks…"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:max-w-sm"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status | 'ALL')}
                className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm">
                <option value="ALL">Status: All</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="DONE">Done</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as Priority | 'ALL')
                }
                className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm">
                <option value="ALL">Priority: All</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
                <option value="P4">P4</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50"
                title="Refresh">
                Run
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="px-4 py-4">
            {loading && (
              <p className="py-12 text-center text-sm text-zinc-500">
                Loading tasks…
              </p>
            )}

            {!loading && results.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-zinc-500">
                  No tasks are tagged with this label.
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Tag tasks with the label to see them here.
                </p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <ul className="space-y-6">
                {grouped.map(([group, items]) => (
                  <li key={group} className="rounded-xl border border-zinc-200">
                    <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/60 px-3 py-2">
                      <span className="text-sm font-medium text-zinc-800">
                        {group}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {items.length} task(s)
                      </span>
                    </div>

                    <ul className="divide-y divide-zinc-100">
                      {items.map((t) => (
                        <li
                          key={t.id}
                          className="flex items-center justify-between px-3 py-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-900" />
                              <p className="truncate text-sm font-medium text-zinc-900">
                                {t.title}
                              </p>
                            </div>
                            <p className="mt-0.5 text-[12px] text-zinc-500">
                              Project:{' '}
                              <span className="font-medium text-zinc-700">
                                {t.project}
                              </span>{' '}
                              · Due:{' '}
                              <span className="font-medium text-zinc-700">
                                {t.dueDate ?? '—'}
                              </span>
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-1">
                              <span className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
                                {t.priority}
                              </span>
                              <span className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
                                {t.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <a
                              href={`/tasks/${t.id}`}
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50">
                              Open
                            </a>
                            <button
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50"
                              onClick={() => alert('TODO: quick complete')}>
                              Complete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Microcopy */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          Pro tip: Combine labels with priority and due date in filters for
          laser-focused daily plans.
        </p>
      </section>
    </main>
  );
}
