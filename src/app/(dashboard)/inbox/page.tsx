// src/app/(dashboard)/inbox/page.tsx
'use client';

import { useMemo, useState } from 'react';

type Priority = 'P1' | 'P2' | 'P3' | 'P4';
type Status = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

type InboxTask = {
  id: string;
  title: string;
  notes?: string;
  createdAt: string; // ISO
  dueDate?: string; // ISO yyyy-mm-dd
  priority: Priority;
  labels: string[];
  status: Status;
  project?: string | null; // null means unassigned (Inbox)
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const demoData: InboxTask[] = [
  {
    id: 'i1',
    title: 'Capture vendor invoice requirements',
    notes: 'Ask finance about tax fields',
    createdAt: new Date().toISOString(),
    priority: 'P2',
    labels: ['@ops'],
    status: 'OPEN',
    project: null,
  },
  {
    id: 'i2',
    title: 'Draft team offsite agenda',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: 'P3',
    labels: ['@people'],
    status: 'OPEN',
    project: null,
  },
  {
    id: 'i3',
    title: 'Reply to client on timeline',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    priority: 'P1',
    labels: ['@waiting'],
    status: 'OPEN',
    project: null,
  },
  {
    id: 'i4',
    title: 'Upload brand assets',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'P4',
    labels: [],
    status: 'OPEN',
    project: null,
  },
];

export default function InboxPage() {
  const [tasks, setTasks] = useState<InboxTask[]>(demoData);
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [newTitle, setNewTitle] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter)
        return false;
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (term) {
        const hay = `${t.title} ${t.notes ?? ''} ${t.labels.join(
          ' ',
        )}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      // inbox view shows only unassigned project tasks
      return !t.project;
    });
  }, [tasks, query, priorityFilter, statusFilter]);

  const capturedToday = filtered.filter(
    (t) => new Date(t.createdAt).toDateString() === new Date().toDateString(),
  );
  const capturedEarlier = filtered.filter(
    (t) => new Date(t.createdAt).toDateString() !== new Date().toDateString(),
  );

  const allSelected =
    filtered.length > 0 && filtered.every((t) => selected[t.id]);
  const selCount = Object.values(selected).filter(Boolean).length;

  function toggleOne(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }
  function toggleAll() {
    if (allSelected) {
      // clear only the ones in current filtered view
      setSelected((s) => {
        const next = { ...s };
        filtered.forEach((t) => delete next[t.id]);
        return next;
      });
    } else {
      setSelected((s) => {
        const next = { ...s };
        filtered.forEach((t) => (next[t.id] = true));
        return next;
      });
    }
  }

  function addQuick() {
    const title = newTitle.trim();
    if (!title) return;
    const t: InboxTask = {
      id: crypto.randomUUID(),
      title,
      createdAt: new Date().toISOString(),
      priority: 'P3',
      labels: [],
      status: 'OPEN',
      project: null,
    };
    setTasks((arr) => [t, ...arr]);
    setNewTitle('');
  }

  function planSelectedDue(date: string) {
    setTasks((arr) =>
      arr.map((t) => (selected[t.id] ? { ...t, dueDate: date } : t)),
    );
  }
  function completeSelected() {
    setTasks((arr) =>
      arr.map((t) => (selected[t.id] ? { ...t, status: 'DONE' } : t)),
    );
    setSelected({});
  }
  function moveSelectedToProject(projectName: string) {
    setTasks((arr) =>
      arr.map((t) => (selected[t.id] ? { ...t, project: projectName } : t)),
    );
    setSelected({});
    alert(`Moved ${selCount} task(s) to project: ${projectName}`);
  }
  function deleteSelected() {
    if (!confirm(`Delete ${selCount} selected task(s)?`)) return;
    setTasks((arr) => arr.filter((t) => !selected[t.id]));
    setSelected({});
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      {/* Subtle background accent */}
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
              Inbox
            </h1>
            <p className="text-sm text-zinc-500">
              Capture tasks at the speed of thought. Triage and move them into
              projects or plan them for Today/Upcoming.
            </p>
          </div>
          {/* Batch actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={completeSelected}
              disabled={selCount === 0}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              title="Complete selected">
              Complete
            </button>
            <div className="relative">
              <details className="group">
                <summary className="flex h-9 cursor-pointer list-none items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50">
                  Plan
                </summary>
                <div className="absolute right-0 z-10 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
                  <button
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-50"
                    onClick={() => planSelectedDue(todayISO())}
                    disabled={selCount === 0}>
                    Today
                  </button>
                  <button
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-50"
                    onClick={() =>
                      planSelectedDue(
                        new Date(Date.now() + 24 * 60 * 60 * 1000)
                          .toISOString()
                          .slice(0, 10),
                      )
                    }
                    disabled={selCount === 0}>
                    Tomorrow
                  </button>
                  <button
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-50"
                    onClick={() =>
                      planSelectedDue(
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .slice(0, 10),
                      )
                    }
                    disabled={selCount === 0}>
                    Next week
                  </button>
                </div>
              </details>
            </div>
            <div className="relative">
              <details className="group">
                <summary className="flex h-9 cursor-pointer list-none items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
                  Move to project
                </summary>
                <div className="absolute right-0 z-10 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
                  {['Core', 'UI', 'CX', 'Ops'].map((p) => (
                    <button
                      key={p}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-50"
                      onClick={() => moveSelectedToProject(p)}
                      disabled={selCount === 0}>
                      {p}
                    </button>
                  ))}
                </div>
              </details>
            </div>
            <button
              onClick={deleteSelected}
              disabled={selCount === 0}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              title="Delete selected">
              Delete
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Quick Add */}
            <div className="flex flex-1 items-center gap-2">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addQuick()}
                placeholder="Quick add a task… (press Enter to add)"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:max-w-md"
              />
              <button
                onClick={addQuick}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
                Add
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search inbox…"
                className="h-9 w-44 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              />
              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as Priority | 'ALL')
                }
                className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm">
                <option value="ALL">Priority: All</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
                <option value="P4">P4</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as Status | 'ALL')
                }
                className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm">
                <option value="ALL">Status: All</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="DONE">Done</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Selection bar */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                checked={allSelected}
                onChange={toggleAll}
              />
              Select all ({filtered.length})
            </label>
            <p className="text-xs text-zinc-500">{selCount} selected</p>
          </div>

          {/* Groups */}
          <div className="px-4 py-4">
            {/* Captured today */}
            <TaskGroup
              title="Captured today"
              items={capturedToday}
              selected={selected}
              onToggle={toggleOne}
              onInline={(id, changes) =>
                setTasks((arr) =>
                  arr.map((t) => (t.id === id ? { ...t, ...changes } : t)),
                )
              }
            />

            {/* Earlier */}
            <TaskGroup
              title="Earlier"
              items={capturedEarlier}
              selected={selected}
              onToggle={toggleOne}
              onInline={(id, changes) =>
                setTasks((arr) =>
                  arr.map((t) => (t.id === id ? { ...t, ...changes } : t)),
                )
              }
            />

            {filtered.length === 0 && (
              <p className="py-12 text-center text-sm text-zinc-500">
                No inbox tasks match your filters.
              </p>
            )}
          </div>
        </div>

        {/* Microcopy */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          Pro tip: Use{' '}
          <kbd className="rounded border border-zinc-300 bg-white px-1">
            Enter
          </kbd>{' '}
          to quick-add, and batch actions to schedule or move tasks.
        </p>
      </section>
    </main>
  );
}

/* ---------- Subcomponents ---------- */

function TaskGroup({
  title,
  items,
  selected,
  onToggle,
  onInline,
}: {
  title: string;
  items: InboxTask[];
  selected: Record<string, boolean>;
  onToggle: (id: string) => void;
  onInline: (id: string, changes: Partial<InboxTask>) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-zinc-200">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/60 px-3 py-2">
        <span className="text-sm font-medium text-zinc-800">{title}</span>
        <span className="text-xs text-zinc-500">{items.length} task(s)</span>
      </div>
      <ul className="divide-y divide-zinc-100">
        {items.map((t) => (
          <li
            key={t.id}
            className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                checked={!!selected[t.id]}
                onChange={() => onToggle(t.id)}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {t.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[12px] text-zinc-500">
                  Created {formatWhen(t.createdAt)} ·{' '}
                  <span className="font-medium text-zinc-700">
                    {t.priority}
                  </span>
                  {t.labels.length > 0 && (
                    <>
                      {' '}
                      ·{' '}
                      {t.labels.map((lbl) => (
                        <span
                          key={lbl}
                          className="mr-1 inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
                          {lbl}
                        </span>
                      ))}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Inline actions */}
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <DueBadge
                value={t.dueDate}
                onChange={(d) => onInline(t.id, { dueDate: d })}
              />
              <select
                className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs"
                value={t.priority}
                onChange={(e) =>
                  onInline(t.id, { priority: e.target.value as Priority })
                }
                title="Priority">
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
                <option value="P4">P4</option>
              </select>
              <button
                className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50"
                onClick={() =>
                  onInline(t.id, {
                    labels: [...new Set([...(t.labels ?? []), '@waiting'])],
                  })
                }
                title="Add @waiting">
                + @waiting
              </button>
              <button
                className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50"
                onClick={() => onInline(t.id, { status: 'DONE' })}
                title="Mark done">
                Done
              </button>
              <button
                className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50"
                onClick={() => onInline(t.id, { project: 'Core' })}
                title="Move to Core">
                → Core
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DueBadge({
  value,
  onChange,
}: {
  value?: string;
  onChange: (newISODate: string) => void;
}) {
  return (
    <div className="relative">
      <details className="group">
        <summary
          className="flex h-8 cursor-pointer list-none items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50"
          title="Set due date">
          {value ? value : 'Set due'}
        </summary>
        <div className="absolute right-0 z-10 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
          <button
            className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-50"
            onClick={() => onChange(todayISO())}>
            Today
          </button>
          <button
            className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-50"
            onClick={() =>
              onChange(
                new Date(Date.now() + 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 10),
              )
            }>
            Tomorrow
          </button>
          <button
            className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-50"
            onClick={() =>
              onChange(
                new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 10),
              )
            }>
            In 3 days
          </button>
          <button
            className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-50"
            onClick={() =>
              onChange(
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 10),
              )
            }>
            Next week
          </button>
          <button
            className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-50"
            onClick={() => onChange('')}>
            Clear
          </button>
        </div>
      </details>
    </div>
  );
}
