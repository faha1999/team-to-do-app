// src/app/(dashboard)/teams/[teamId]/page.tsx  (Team overview)
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Metric = { label: string; value: number; hint?: string };
type Member = { id: string; name: string; role: 'ADMIN' | 'MEMBER' | 'GUEST' };
type MiniProject = {
  id: string;
  name: string;
  open: number;
  overdue: number;
  updatedAt: string;
};

const demoMembers: Member[] = [
  { id: 'u1', name: 'You', role: 'ADMIN' },
  { id: 'u2', name: 'Fahad', role: 'MEMBER' },
  { id: 'u3', name: 'Amira', role: 'MEMBER' },
  { id: 'u4', name: 'Sara', role: 'GUEST' },
];

const demoProjects: MiniProject[] = [
  {
    id: 'proj_core',
    name: 'Core Platform',
    open: 42,
    overdue: 3,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj_ui',
    name: 'UI System',
    open: 18,
    overdue: 1,
    updatedAt: new Date(Date.now() - 6 * 36e5).toISOString(),
  },
  {
    id: 'proj_ops',
    name: 'Operations',
    open: 9,
    overdue: 0,
    updatedAt: new Date(Date.now() - 2 * 864e5).toISOString(),
  },
];

export default function TeamOverviewPage({
  params,
}: {
  params: { teamId: string };
}) {
  const { teamId } = params;

  const [members] = useState<Member[]>(demoMembers);
  const [projects] = useState<MiniProject[]>(demoProjects);

  const metrics: Metric[] = useMemo(() => {
    const open = projects.reduce((a, p) => a + p.open, 0);
    const overdue = projects.reduce((a, p) => a + p.overdue, 0);
    return [
      { label: 'Open tasks', value: open },
      { label: 'Overdue', value: overdue },
      { label: 'Projects', value: projects.length },
      { label: 'Members', value: members.length },
    ];
  }, [projects, members]);

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

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
              Team — {teamId}
            </h1>
            <p className="text-sm text-zinc-500">
              Overview of work, people, and recent activity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/teams/${teamId}/projects`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              Projects
            </Link>
            <Link
              href={`/teams/${teamId}/activity`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              Activity
            </Link>
            <Link
              href={`/teams/${teamId}/settings`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              Settings
            </Link>
          </div>
        </div>

        {/* Metrics */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-zinc-500">{m.label}</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-950 tabular-nums">
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Projects */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/60 px-4 py-3">
              <h2 className="text-sm font-semibold text-zinc-900">
                Recent projects
              </h2>
              <Link
                href={`/teams/${teamId}/projects`}
                className="text-xs font-medium text-zinc-700 underline underline-offset-4 hover:opacity-90">
                View all
              </Link>
            </div>
            <ul className="divide-y divide-zinc-100">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {p.name}
                    </p>
                    <p className="text-[12px] text-zinc-500">
                      {p.open} open · {p.overdue} overdue · Updated{' '}
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/projects/${p.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50">
                      Open
                    </Link>
                    <Link
                      href={`/projects/${p.id}/board`}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50">
                      Board
                    </Link>
                  </div>
                </li>
              ))}
              {projects.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-zinc-500">
                  No projects yet.
                </li>
              )}
            </ul>
          </div>

          {/* Members */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/60 px-4 py-3">
              <h2 className="text-sm font-semibold text-zinc-900">Members</h2>
              <Link
                href={`/teams/${teamId}/settings`}
                className="text-xs font-medium text-zinc-700 underline underline-offset-4 hover:opacity-90">
                Manage
              </Link>
            </div>
            <ul className="divide-y divide-zinc-100">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {m.name}
                    </p>
                    <p className="text-[12px] text-zinc-500">{m.role}</p>
                  </div>
                  <Link
                    href={`/teams/${teamId}/settings`}
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50">
                    Change role
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Microcopy */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          Tip: Team projects live here; personal projects stay private.
        </p>
      </section>
    </main>
  );
}
