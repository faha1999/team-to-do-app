// src/app/(dashboard)/projects/page.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Visibility = 'PUBLIC' | 'PRIVATE';
type Status = 'ACTIVE' | 'ARCHIVED';
type ViewType = 'LIST' | 'BOARD';

type Project = {
  id: string;
  name: string;
  description?: string;
  team?: string | null;
  visibility: Visibility;
  status: Status;
  viewType: ViewType;
  tasksOpen: number;
  tasksOverdue: number;
  updatedAt: string; // ISO
};

const demoProjects: Project[] = [
  {
    id: 'proj_core',
    name: 'Core Platform',
    description: 'Backend, APIs, auth, and infra.',
    team: 'Engineering',
    visibility: 'PUBLIC',
    status: 'ACTIVE',
    viewType: 'LIST',
    tasksOpen: 42,
    tasksOverdue: 3,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj_ui',
    name: 'UI/Design System',
    description: 'Components, tokens, and visual language.',
    team: 'Design',
    visibility: 'PUBLIC',
    status: 'ACTIVE',
    viewType: 'BOARD',
    tasksOpen: 18,
    tasksOverdue: 1,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'proj_ops',
    name: 'Operations',
    description: 'Processes, finance, vendor mgmt.',
    team: 'Operations',
    visibility: 'PRIVATE',
    status: 'ACTIVE',
    viewType: 'LIST',
    tasksOpen: 9,
    tasksOverdue: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'proj_archive',
    name: 'Legacy Migration',
    description: 'Decommission and move to new stack.',
    team: 'Engineering',
    visibility: 'PRIVATE',
    status: 'ARCHIVED',
    viewType: 'BOARD',
    tasksOpen: 0,
    tasksOverdue: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
];

export default function ProjectsIndexPage() {
  const [projects] = useState<Project[]>(demoProjects);
  const [q, setQ] = useState('');
  const [onlyTeam, setOnlyTeam] = useState<string | 'ALL'>('ALL');
  const [status, setStatus] = useState<Status | 'ALL'>('ALL');
  const [visibility, setVisibility] = useState<Visibility | 'ALL'>('ALL');
  const [sort, setSort] = useState<'recent' | 'alpha' | 'open'>('recent');

  const teams = useMemo(() => {
    const set = new Set(
      projects.map((p) => p.team).filter(Boolean) as string[],
    );
    return ['ALL', ...Array.from(set)];
  }, [projects]);

  const filtered = useMemo(() => {
    let arr = [...projects];
    if (q.trim()) {
      const t = q.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          (p.description ?? '').toLowerCase().includes(t) ||
          (p.team ?? '').toLowerCase().includes(t),
      );
    }
    if (onlyTeam !== 'ALL') arr = arr.filter((p) => p.team === onlyTeam);
    if (status !== 'ALL') arr = arr.filter((p) => p.status === status);
    if (visibility !== 'ALL')
      arr = arr.filter((p) => p.visibility === visibility);

    if (sort === 'alpha') arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'recent')
      arr.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    if (sort === 'open') arr.sort((a, b) => b.tasksOpen - a.tasksOpen);
    return arr;
  }, [projects, q, onlyTeam, status, visibility, sort]);

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
              Projects
            </h1>
            <p className="text-sm text-zinc-500">
              A shared workspace to organize work and ship on time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/(dashboard)/projects/new"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              + New project
            </a>
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
                placeholder="Search projects…"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:max-w-sm"
              />
              <select
                className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm"
                value={onlyTeam}
                onChange={(e) => setOnlyTeam(e.target.value as any)}>
                {teams.map((t) => (
                  <option key={t} value={t}>
                    Team: {t}
                  </option>
                ))}
              </select>
              <select
                className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}>
                <option value="ALL">Status: All</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <select
                className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}>
                <option value="ALL">Visibility: All</option>
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
            <div>
              <select
                className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}>
                <option value="recent">Sort: Recent</option>
                <option value="alpha">Sort: A–Z</option>
                <option value="open">Sort: Open tasks</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <ul className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <li
                key={p.id}
                className="group rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/projects/${p.id}`}
                      className="text-sm font-semibold text-zinc-950 underline underline-offset-4 group-hover:opacity-90">
                      {p.name}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-[13px] text-zinc-600">
                      {p.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge label={p.visibility} />
                      <Badge label={p.status} />
                      {p.team && <Badge label={p.team} />}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Updated</p>
                    <p className="text-xs font-medium text-zinc-700">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[12px] text-zinc-600">
                    <span className="inline-flex items-center gap-1">
                      <i className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-900" />
                      {p.tasksOpen} open
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <i className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-400" />
                      {p.tasksOverdue} overdue
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/projects/${p.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50">
                      List view
                    </Link>
                    <Link
                      href={`/projects/${p.id}/board`}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50">
                      Board
                    </Link>
                    <Link
                      href={`/projects/${p.id}/settings`}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50">
                      Settings
                    </Link>
                  </div>
                </div>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="col-span-full py-12 text-center text-sm text-zinc-500">
                No projects match your filters.
              </li>
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
      {label}
    </span>
  );
}
