// src/app/(dashboard)/filters/[id]/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

// ---- Types ----
type QueryJSON = {
  projects?: string[];
  labels?: string[];
  priority?: ('P1' | 'P2' | 'P3' | 'P4')[];
  assigneeId?: string | 'me';
  status?: ('OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED')[];
  due?: { op: 'on' | 'onOrBefore' | 'onOrAfter'; date: string };
};

type SavedFilter = {
  id: string;
  name: string;
  shared: boolean;
  owner: { id: string; name: string };
  queryJSON: QueryJSON;
  updatedAt: string;
};

type Task = {
  id: string;
  title: string;
  project: string;
  labels: string[];
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  assigneeId?: string;
  dueDate?: string; // ISO yyyy-mm-dd
};

// ---- Mock data & helpers (replace with real data) ----
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchFilterById(id: string): Promise<SavedFilter | null> {
  // TODO: replace with prisma.savedFilter.findUnique({ where: { id } })
  const samples: SavedFilter[] = [
    {
      id: 'flt_today_p1',
      name: 'Today · P1 only',
      shared: true,
      owner: { id: 'u1', name: 'You' },
      queryJSON: {
        due: { op: 'on', date: todayISO() },
        priority: ['P1'],
        status: ['OPEN', 'IN_PROGRESS'],
      },
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'flt_waiting',
      name: '@waiting (all projects)',
      shared: false,
      owner: { id: 'u1', name: 'You' },
      queryJSON: { labels: ['@waiting'], status: ['OPEN', 'IN_PROGRESS'] },
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
  ];
  return samples.find((f) => f.id === id) ?? null;
}

async function fetchTasks(): Promise<Task[]> {
  // TODO: replace with prisma.task.findMany(...) scoped by user/team
  return [
    {
      id: 't1',
      title: 'Draft PRD',
      project: 'Core',
      labels: ['@writing'],
      priority: 'P2',
      status: 'IN_PROGRESS',
      assigneeId: 'me',
      dueDate: todayISO(),
    },
    {
      id: 't2',
      title: 'Prepare client demo',
      project: 'CX',
      labels: ['@waiting', '@design'],
      priority: 'P1',
      status: 'OPEN',
      assigneeId: 'me',
      dueDate: todayISO(),
    },
    {
      id: 't3',
      title: 'QA checklist',
      project: 'UI',
      labels: ['@qa'],
      priority: 'P3',
      status: 'OPEN',
      assigneeId: 'u2',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    },
    {
      id: 't4',
      title: 'Retro notes',
      project: 'Ops',
      labels: ['@waiting'],
      priority: 'P2',
      status: 'OPEN',
      assigneeId: 'me',
      dueDate: new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10),
    },
  ];
}

function applyFilter(tasks: Task[], q: QueryJSON, currentUserId = 'me') {
  return tasks.filter((t) => {
    if (q.projects && q.projects.length && !q.projects.includes(t.project))
      return false;
    if (
      q.labels &&
      q.labels.length &&
      !q.labels.every((lbl) => t.labels.includes(lbl))
    )
      return false;
    if (q.priority && q.priority.length && !q.priority.includes(t.priority))
      return false;
    if (q.status && q.status.length && !q.status.includes(t.status))
      return false;

    if (q.assigneeId) {
      const matchId = q.assigneeId === 'me' ? currentUserId : q.assigneeId;
      if (t.assigneeId !== matchId) return false;
    }

    if (q.due && t.dueDate) {
      const taskDate = t.dueDate;
      const cmp = (a: string, b: string) =>
        new Date(a).getTime() - new Date(b).getTime();
      if (q.due.op === 'on' && taskDate !== q.due.date) return false;
      if (q.due.op === 'onOrBefore' && cmp(taskDate, q.due.date) > 0)
        return false;
      if (q.due.op === 'onOrAfter' && cmp(taskDate, q.due.date) < 0)
        return false;
    }

    return true;
  });
}

// ---- Page ----
export default function FilterRunPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [filter, setFilter] = useState<SavedFilter | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [f, ts] = await Promise.all([fetchFilterById(id), fetchTasks()]);
      setFilter(f);
      setAllTasks(ts);
      setLoading(false);
    })();
  }, [id]);

  const results = useMemo(() => {
    if (!filter) return [];
    return applyFilter(allTasks, filter.queryJSON);
  }, [allTasks, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of results) {
      const key = `${t.project} • ${t.dueDate ?? 'No due'}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
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
              <h1 className="truncate text-xl font-semibold tracking-tight text-zinc-950">
                {filter ? filter.name : 'Filter'}
              </h1>
              {filter && (
                <>
                  <span className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
                    {filter.shared ? 'Shared' : 'Private'}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
                    Owner: {filter.owner.name}
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {filter
                ? `Updated ${new Date(filter.updatedAt).toLocaleString()}`
                : 'Loading…'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/(dashboard)/filters"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              ← All filters
            </Link>
            <a
              href={`/ (dashboard)/filters/${id}/edit`.replace(' ', '')}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              Edit
            </a>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50"
              onClick={() => alert('TODO: share link copied')}>
              Share
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50"
              onClick={() => window.location.reload()}
              title="Re-run filter">
              Run
            </button>
          </div>
        </div>

        {/* Card with query + results */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
          {/* Query summary */}
          <div className="border-b border-zinc-200 bg-zinc-50/60 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Query
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-700">
                  {filter ? JSON.stringify(filter.queryJSON) : '—'}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  checked={compact}
                  onChange={(e) => setCompact(e.target.checked)}
                />
                Compact rows
              </label>
            </div>
          </div>

          {/* Results */}
          <div className="px-4 py-4">
            {loading && (
              <p className="py-12 text-center text-sm text-zinc-500">
                Running filter…
              </p>
            )}

            {!loading && results.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-zinc-500">
                  No tasks match this filter.
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Try relaxing labels, due date, or priority.
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
                          className={`flex items-center justify-between px-3 ${
                            compact ? 'py-2' : 'py-3'
                          }`}>
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
                              {t.labels.map((lbl) => (
                                <span
                                  key={lbl}
                                  className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
                                  {lbl}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <a
                              href={`/ (dashboard)/tasks/${t.id}`.replace(
                                ' ',
                                '',
                              )}
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50">
                              Open
                            </a>
                            <button
                              type="button"
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
      </section>
    </main>
  );
}
