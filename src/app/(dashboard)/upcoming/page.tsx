// src/app/(dashboard)/upcoming/page.tsx
'use client';

import { useMemo, useState } from 'react';

type Priority = 'P1' | 'P2' | 'P3' | 'P4';
type Status = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

type Task = {
  id: string;
  title: string;
  project?: string | null;
  priority: Priority;
  status: Status;
  dueDate?: string; // ISO yyyy-mm-dd
  labels: string[];
};

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);

const day = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return iso(d);
};

const demo: Task[] = [
  {
    id: 'u1',
    title: 'Sprint planning',
    project: 'UI System',
    priority: 'P2',
    status: 'OPEN',
    dueDate: day(1),
    labels: ['@planning'],
  },
  {
    id: 'u2',
    title: 'Invoice approvals',
    project: 'Operations',
    priority: 'P3',
    status: 'OPEN',
    dueDate: day(2),
    labels: ['@ops'],
  },
  {
    id: 'u3',
    title: 'OKR draft',
    project: 'Core Platform',
    priority: 'P2',
    status: 'OPEN',
    dueDate: day(3),
    labels: ['@strategy'],
  },
  {
    id: 'u4',
    title: 'Design tokens PR',
    project: 'UI System',
    priority: 'P1',
    status: 'IN_PROGRESS',
    dueDate: day(5),
    labels: ['@frontend'],
  },
  {
    id: 'u5',
    title: 'Security review',
    project: 'Core Platform',
    priority: 'P1',
    status: 'OPEN',
    dueDate: day(8),
    labels: ['@security'],
  },
  {
    id: 'u6',
    title: 'Quarterly report',
    project: 'Operations',
    priority: 'P2',
    status: 'OPEN',
    dueDate: day(14),
    labels: ['@finance'],
  },
];

export default function UpcomingPage() {
  const [tasks, setTasks] = useState<Task[]>(demo);
  const [q, setQ] = useState('');
  const [priority, setPriority] = useState<Priority | 'ALL'>('ALL');
  const [status, setStatus] = useState<Status | 'ALL'>('ALL');
  const [range, setRange] = useState<'7' | '14' | '30'>('14');

  const filtered = useMemo(() => {
    const horizon = Number(range);
    const end = new Date();
    end.setDate(end.getDate() + horizon);
    let arr = tasks.filter((t) => t.dueDate && +new Date(t.dueDate) <= +end);
    if (q.trim()) {
      const term = q.toLowerCase();
      arr = arr.filter((t) =>
        `${t.title} ${t.project ?? ''} ${t.labels.join(' ')}`
          .toLowerCase()
          .includes(term),
      );
    }
    if (priority !== 'ALL') arr = arr.filter((t) => t.priority === priority);
    if (status !== 'ALL') arr = arr.filter((t) => t.status === status);
    return arr.sort((a, b) => +new Date(a.dueDate!) - +new Date(b.dueDate!));
  }, [tasks, q, priority, status, range]);

  const groups = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of filtered) {
      const key = t.dueDate!;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [filtered]);

  function complete(id: string) {
    setTasks((xs) =>
      xs.map((t) => (t.id === id ? { ...t, status: 'DONE' } : t)),
    );
  }

  return (
    <main>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
          Upcoming
        </h1>
        <p className="text-sm text-zinc-500">
          Plan ahead with weekly & monthly views of what’s next.
        </p>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search upcoming…"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:max-w-sm"
            />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as any)}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm">
              <option value="7">Next 7 days</option>
              <option value="14">Next 14 days</option>
              <option value="30">Next 30 days</option>
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm">
              <option value="ALL">Priority: All</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="P4">P4</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm">
              <option value="ALL">Status: All</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="DONE">Done</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="text-xs text-zinc-500">
            {new Date().toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Groups by date */}
        <div className="p-4">
          {groups.map(([date, items]) => (
            <div
              key={date}
              className="mb-6 overflow-hidden rounded-xl border border-zinc-200">
              <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/60 px-3 py-2">
                <span className="text-sm font-medium text-zinc-800">
                  {formatDate(date)} · {items.length} task(s)
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
                        {t.project ?? 'No project'} · Priority{' '}
                        <span className="font-medium text-zinc-700">
                          {t.priority}
                        </span>
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {t.labels.map((l) => (
                          <span
                            key={l}
                            className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => complete(t.id)}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50">
                        Mark done
                      </button>
                      <a
                        href={`/projects/${slugify(t.project || 'personal')}`}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50">
                        Open project
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {groups.length === 0 && (
            <p className="py-12 text-center text-sm text-zinc-500">
              Nothing upcoming in this window. You’re ahead of schedule ✨
            </p>
          )}
        </div>
      </div>

      {/* Microcopy */}
      <p className="mt-6 text-center text-xs text-zinc-500">
        Tip: Use filters to build views like “all P1 due this week” or “@waiting
        in Work”.
      </p>
    </main>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-');
}
