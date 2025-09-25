// src/app/(dashboard)/page.tsx  (Today view)
'use client';

import { useMemo, useState } from 'react';

type Priority = 'P1' | 'P2' | 'P3' | 'P4';
type Status = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

type Task = {
  id: string;
  title: string;
  notes?: string;
  project?: string | null;
  dueDate?: string; // ISO yyyy-mm-dd
  startAt?: string; // ISO time hint for schedule block
  endAt?: string; // ISO time hint
  priority: Priority;
  status: Status;
  labels: string[];
  assignee?: string | null;
};

const now = new Date();
const todayISO = now.toISOString().slice(0, 10);

const demoTasks: Task[] = [
  {
    id: 't1',
    title: 'Ship calendar week view',
    project: 'UI System',
    dueDate: todayISO,
    startAt: `${todayISO}T09:00:00.000Z`,
    endAt: `${todayISO}T10:30:00.000Z`,
    priority: 'P1',
    status: 'IN_PROGRESS',
    labels: ['@frontend'],
    assignee: 'You',
  },
  {
    id: 't2',
    title: 'Spec recurring task RRULEs',
    project: 'Core Platform',
    dueDate: todayISO,
    startAt: `${todayISO}T11:00:00.000Z`,
    endAt: `${todayISO}T11:45:00.000Z`,
    priority: 'P2',
    status: 'OPEN',
    labels: ['@api', '@planning'],
    assignee: 'Fahad',
  },
  {
    id: 't3',
    title: 'Reply to vendor',
    project: 'Operations',
    dueDate: todayISO,
    priority: 'P3',
    status: 'OPEN',
    labels: ['@ops', '@waiting'],
  },
  {
    id: 't4',
    title: 'Migrate auth session to JWT',
    project: 'Core Platform',
    dueDate: todayISO,
    startAt: `${todayISO}T14:00:00.000Z`,
    endAt: `${todayISO}T16:00:00.000Z`,
    priority: 'P2',
    status: 'OPEN',
    labels: ['@backend'],
  },
  {
    id: 't5',
    title: 'Polish empty states',
    project: 'UI System',
    dueDate: todayISO,
    priority: 'P4',
    status: 'OPEN',
    labels: ['@design'],
  },
];

export default function TodayPage() {
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState<Priority | 'ALL'>('ALL');
  const [status, setStatus] = useState<Status | 'ALL'>('ALL');
  const [newTitle, setNewTitle] = useState('');

  const filtered = useMemo(() => {
    let arr = tasks.filter((t) => t.dueDate === todayISO);
    if (query.trim()) {
      const term = query.toLowerCase();
      arr = arr.filter((t) =>
        `${t.title} ${t.notes ?? ''} ${t.project ?? ''} ${t.labels.join(' ')}`
          .toLowerCase()
          .includes(term),
      );
    }
    if (priority !== 'ALL') arr = arr.filter((t) => t.priority === priority);
    if (status !== 'ALL') arr = arr.filter((t) => t.status === status);
    return arr;
  }, [tasks, query, priority, status]);

  const schedule = useMemo(() => {
    return [...filtered]
      .filter((t) => t.startAt)
      .sort((a, b) => +new Date(a.startAt!) - +new Date(b.startAt!));
  }, [filtered]);

  const focusList = useMemo(() => {
    return [...filtered].sort((a, b) => a.priority.localeCompare(b.priority));
  }, [filtered]);

  function addQuick() {
    const title = newTitle.trim();
    if (!title) return;
    setTasks((xs) => [
      {
        id: crypto.randomUUID(),
        title,
        project: null,
        dueDate: todayISO,
        priority: 'P3',
        status: 'OPEN',
        labels: [],
      },
      ...xs,
    ]);
    setNewTitle('');
  }

  function toggleDone(id: string) {
    setTasks((xs) =>
      xs.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'DONE' ? 'OPEN' : 'DONE' }
          : t,
      ),
    );
  }

  return (
    <main>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
          Today
        </h1>
        <p className="text-sm text-zinc-500">
          Stay organized and focused — see only what needs doing today.
        </p>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addQuick()}
              placeholder="Quick add a task for Today… (Enter to add)"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:max-w-md"
            />
            <button
              onClick={addQuick}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              Add
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search today…"
              className="h-9 w-44 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
            />
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
        </div>

        {/* Content grid */}
        <div className="grid gap-6 p-4 lg:grid-cols-2">
          {/* Focus list */}
          <section className="overflow-hidden rounded-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/60 px-3 py-2">
              <span className="text-sm font-medium text-zinc-800">
                Focus for today · {focusList.length}
              </span>
            </div>
            <ul className="divide-y divide-zinc-100">
              {focusList.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between px-3 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={t.status === 'DONE'}
                        onChange={() => toggleDone(t.id)}
                        className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                      />
                      <p
                        className={`truncate text-sm font-medium ${
                          t.status === 'DONE'
                            ? 'text-zinc-400 line-through'
                            : 'text-zinc-900'
                        }`}
                        title={t.title}>
                        {t.title}
                      </p>
                    </div>
                    <p className="mt-0.5 text-[12px] text-zinc-500">
                      {t.project ?? 'No project'} · Priority{' '}
                      <span className="font-medium text-zinc-700">
                        {t.priority}
                      </span>{' '}
                      · Labels:{' '}
                      {t.labels.length ? (
                        t.labels.map((l) => (
                          <span
                            key={l}
                            className="mr-1 inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
                            {l}
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs">
                      {t.assignee ?? 'Unassigned'}
                    </span>
                    <span className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs">
                      {t.dueDate}
                    </span>
                  </div>
                </li>
              ))}
              {focusList.length === 0 && (
                <li className="px-3 py-10 text-center text-sm text-zinc-500">
                  Nothing scheduled for today. Enjoy the clear runway!
                </li>
              )}
            </ul>
          </section>

          {/* Schedule timeline */}
          <section className="overflow-hidden rounded-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/60 px-3 py-2">
              <span className="text-sm font-medium text-zinc-800">
                Schedule
              </span>
              <span className="text-xs text-zinc-500">
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <ul className="space-y-3 p-3">
              {schedule.map((t) => (
                <li
                  key={t.id}
                  className="rounded-lg border border-zinc-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {t.title}
                    </p>
                    <span className="shrink-0 text-xs text-zinc-600">
                      {formatTimeRange(t.startAt!, t.endAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-zinc-500">
                    {t.project ?? 'No project'} · {t.priority}
                  </p>
                </li>
              ))}
              {schedule.length === 0 && (
                <li className="rounded-lg border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
                  No time-blocked tasks yet. Add start/end times to visualize
                  your day.
                </li>
              )}
            </ul>
          </section>
        </div>
      </div>

      {/* Microcopy */}
      <p className="mt-6 text-center text-xs text-zinc-500">
        Pro tip: Drag tasks into time blocks (wire up later) to protect focus
        hours.
      </p>
    </main>
  );
}

function formatTimeRange(startISO: string, endISO?: string) {
  const s = new Date(startISO);
  const e = endISO ? new Date(endISO) : null;
  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return e ? `${fmt(s)}–${fmt(e)}` : fmt(s);
}
