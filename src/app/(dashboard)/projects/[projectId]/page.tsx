// src/app/(dashboard)/projects/[projectId]/page.tsx  (List view)
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Priority = 'P1' | 'P2' | 'P3' | 'P4';
type Status = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

type Task = {
  id: string;
  title: string;
  section?: string;
  priority: Priority;
  status: Status;
  assignee?: string | null;
  dueDate?: string; // ISO
  labels: string[];
};

type Section = {
  id: string;
  name: string;
  order: number;
};

const demoSections: Section[] = [
  { id: 'sec_1', name: 'Backlog', order: 1 },
  { id: 'sec_2', name: 'In Progress', order: 2 },
  { id: 'sec_3', name: 'Review', order: 3 },
];

const demoTasks: Task[] = [
  {
    id: 't1',
    title: 'Auth: email verify',
    section: 'Backlog',
    priority: 'P2',
    status: 'OPEN',
    assignee: 'Fahad',
    labels: ['@backend'],
  },
  {
    id: 't2',
    title: 'API: tasks pagination',
    section: 'In Progress',
    priority: 'P1',
    status: 'IN_PROGRESS',
    assignee: 'You',
    labels: ['@api'],
  },
  {
    id: 't3',
    title: 'Implement filter DSL',
    section: 'Review',
    priority: 'P2',
    status: 'IN_PROGRESS',
    assignee: 'Amira',
    labels: ['@tooling'],
  },
  {
    id: 't4',
    title: 'Docs: contribution guide',
    section: 'Backlog',
    priority: 'P3',
    status: 'OPEN',
    assignee: null,
    labels: ['@docs'],
  },
];

export default function ProjectListPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;

  const [sections] = useState<Section[]>(demoSections);
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [q, setQ] = useState('');
  const [priority, setPriority] = useState<Priority | 'ALL'>('ALL');
  const [status, setStatus] = useState<Status | 'ALL'>('ALL');
  const [compact, setCompact] = useState(false);

  const sectionOrder = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections],
  );

  const filtered = useMemo(() => {
    let arr = [...tasks];
    if (q.trim()) {
      const t = q.toLowerCase();
      arr = arr.filter(
        (x) =>
          x.title.toLowerCase().includes(t) ||
          (x.assignee ?? '').toLowerCase().includes(t) ||
          x.labels.join(' ').toLowerCase().includes(t),
      );
    }
    if (priority !== 'ALL') arr = arr.filter((x) => x.priority === priority);
    if (status !== 'ALL') arr = arr.filter((x) => x.status === status);
    return arr;
  }, [tasks, q, priority, status]);

  const bySection = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const s of sectionOrder) map.set(s.name, []);
    for (const t of filtered) {
      const key = t.section ?? 'Backlog';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries());
  }, [filtered, sectionOrder]);

  function quickAdd(sectionName: string) {
    const title = prompt(`New task title for "${sectionName}"`);
    if (!title) return;
    setTasks((arr) => [
      {
        id: crypto.randomUUID(),
        title,
        section: sectionName,
        priority: 'P3',
        status: 'OPEN',
        assignee: null,
        labels: [],
      },
      ...arr,
    ]);
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
              Project — {projectId}
            </h1>
            <p className="text-sm text-zinc-500">
              List view. Organize with sections & quick inline controls.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${projectId}/board`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              Board
            </Link>
            <Link
              href={`/projects/${projectId}/settings`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              Settings
            </Link>
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
                className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}>
                <option value="ALL">Priority: All</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
                <option value="P4">P4</option>
              </select>
              <select
                className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}>
                <option value="ALL">Status: All</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="DONE">Done</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                checked={compact}
                onChange={(e) => setCompact(e.target.checked)}
              />
              Compact rows
            </label>
          </div>

          {/* Sections */}
          <div className="grid gap-4 p-4">
            {bySection.map(([sectionName, items]) => (
              <div
                key={sectionName}
                className="overflow-hidden rounded-xl border border-zinc-200">
                <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/60 px-3 py-2">
                  <span className="text-sm font-medium text-zinc-800">
                    {sectionName} · {items.length} task(s)
                  </span>
                  <button
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50"
                    onClick={() => quickAdd(sectionName)}>
                    + Add task
                  </button>
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
                          {t.assignee
                            ? `Assignee: ${t.assignee}`
                            : 'Unassigned'}{' '}
                          · Priority{' '}
                          <span className="font-medium text-zinc-700">
                            {t.priority}
                          </span>{' '}
                          · Due{' '}
                          <span className="font-medium text-zinc-700">
                            {t.dueDate ?? '—'}
                          </span>
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
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
                        <button className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50">
                          Complete
                        </button>
                        <button className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50">
                          Edit
                        </button>
                        <button className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50">
                          •••
                        </button>
                      </div>
                    </li>
                  ))}
                  {items.length === 0 && (
                    <li className="px-3 py-6 text-center text-sm text-zinc-500">
                      No tasks in this section.
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Microcopy */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          Tip: switch to the Board for Kanban flow, or open Settings to adjust
          roles & visibility.
        </p>
      </section>
    </main>
  );
}
