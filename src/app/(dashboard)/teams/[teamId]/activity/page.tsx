// src/app/(dashboard)/teams/[teamId]/activity/page.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type ActivityKind =
  | 'TASK_CREATED'
  | 'TASK_COMPLETED'
  | 'COMMENT'
  | 'PROJECT_CREATED'
  | 'ROLE_CHANGED';
type Activity = {
  id: string;
  at: string; // ISO
  actor: string;
  kind: ActivityKind;
  text: string;
  project?: string;
};

const demoActivity: Activity[] = [
  {
    id: 'a5',
    at: new Date().toISOString(),
    actor: 'You',
    kind: 'TASK_COMPLETED',
    text: 'Completed “Docs sidebar IA”',
    project: 'UI System',
  },
  {
    id: 'a4',
    at: new Date(Date.now() - 1 * 36e5).toISOString(),
    actor: 'Fahad',
    kind: 'COMMENT',
    text: 'Commented on “Server Actions”',
    project: 'Core Platform',
  },
  {
    id: 'a3',
    at: new Date(Date.now() - 5 * 36e5).toISOString(),
    actor: 'Amira',
    kind: 'TASK_CREATED',
    text: 'Added “Spec typography tokens”',
    project: 'UI System',
  },
  {
    id: 'a2',
    at: new Date(Date.now() - 1 * 864e5).toISOString(),
    actor: 'Sara',
    kind: 'ROLE_CHANGED',
    text: 'Promoted Amira to Admin',
  },
  {
    id: 'a1',
    at: new Date(Date.now() - 3 * 864e5).toISOString(),
    actor: 'You',
    kind: 'PROJECT_CREATED',
    text: 'Created project “Operations”',
  },
];

export default function TeamActivityPage({
  params,
}: {
  params: { teamId: string };
}) {
  const { teamId } = params;

  const [items] = useState<Activity[]>(demoActivity);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<ActivityKind | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    let arr = [...items];
    if (kind !== 'ALL') arr = arr.filter((x) => x.kind === kind);
    if (q.trim()) {
      const term = q.toLowerCase();
      arr = arr.filter(
        (x) =>
          x.text.toLowerCase().includes(term) ||
          x.actor.toLowerCase().includes(term) ||
          (x.project ?? '').toLowerCase().includes(term),
      );
    }
    return arr;
  }, [items, q, kind]);

  // Group by date (YYYY-MM-DD)
  const grouped = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const x of filtered) {
      const key = x.at.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(x);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-x-0 top-[-10rem] mx-auto h-[24rem] w-[36rem] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 40%, rgba(24,24,27,0.10), rgba(24,24,27,0))',
          }}
        />
      </div>

      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
              Team — {teamId} · Activity
            </h1>
            <p className="text-sm text-zinc-500">
              Stay on top of who did what and when.
            </p>
          </div>
          <Link
            href={`/teams/${teamId}`}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
            ← Back to team
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search activity…"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:max-w-sm"
              />
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as any)}
                className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm">
                <option value="ALL">Type: All</option>
                <option value="TASK_CREATED">Task created</option>
                <option value="TASK_COMPLETED">Task completed</option>
                <option value="COMMENT">Comment</option>
                <option value="PROJECT_CREATED">Project created</option>
                <option value="ROLE_CHANGED">Role changed</option>
              </select>
            </div>
            <button
              onClick={() => alert('Export CSV (wire later)')}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              Export CSV
            </button>
          </div>

          {/* Timeline */}
          <div className="p-4">
            {grouped.map(([date, rows]) => (
              <div key={date} className="mb-6">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {new Date(date).toLocaleDateString()}
                </div>
                <ul className="space-y-2">
                  {rows.map((x) => (
                    <li
                      key={x.id}
                      className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-zinc-900" />
                      <div className="min-w-0">
                        <p className="text-[13px] text-zinc-800">
                          <span className="font-medium">{x.actor}</span>{' '}
                          {x.text}
                          {x.project && (
                            <>
                              {' '}
                              <span className="text-zinc-500">in</span>{' '}
                              <span className="font-medium">{x.project}</span>
                            </>
                          )}
                        </p>
                        <p className="mt-0.5 text-[11px] text-zinc-500">
                          {new Date(x.at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          · {x.kind}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {grouped.length === 0 && (
              <p className="py-12 text-center text-sm text-zinc-500">
                No activity found.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
