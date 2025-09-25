// src/app/(dashboard)/teams/page.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Visibility = 'PUBLIC' | 'PRIVATE';
type Team = {
  id: string;
  name: string;
  description?: string;
  visibility: Visibility;
  members: number;
  projects: number;
  updatedAt: string; // ISO
};

const demoTeams: Team[] = [
  {
    id: 'team_eng',
    name: 'Engineering',
    description: 'Core, platform, infra.',
    visibility: 'PUBLIC',
    members: 18,
    projects: 6,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'team_design',
    name: 'Design',
    description: 'UI system, tokens, research.',
    visibility: 'PUBLIC',
    members: 7,
    projects: 3,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'team_ops',
    name: 'Operations',
    description: 'Finance, vendor, HR.',
    visibility: 'PRIVATE',
    members: 5,
    projects: 4,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

export default function TeamsIndexPage() {
  const [teams, setTeams] = useState<Team[]>(demoTeams);
  const [activeTeamId, setActiveTeamId] = useState<string>('team_eng');
  const [q, setQ] = useState('');
  const [visibility, setVisibility] = useState<Visibility | 'ALL'>('ALL');
  const [sort, setSort] = useState<'recent' | 'alpha' | 'size'>('recent');

  const filtered = useMemo(() => {
    let arr = [...teams];
    if (q.trim()) {
      const term = q.toLowerCase();
      arr = arr.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          (t.description ?? '').toLowerCase().includes(term),
      );
    }
    if (visibility !== 'ALL')
      arr = arr.filter((t) => t.visibility === visibility);

    if (sort === 'alpha') arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'recent')
      arr.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    if (sort === 'size') arr.sort((a, b) => b.members - a.members);
    return arr;
  }, [teams, q, visibility, sort]);

  function createTeam() {
    const name = prompt('Team name?');
    if (!name) return;
    setTeams((xs) => [
      {
        id: crypto.randomUUID(),
        name,
        description: '',
        visibility: 'PUBLIC',
        members: 1,
        projects: 0,
        updatedAt: new Date().toISOString(),
      },
      ...xs,
    ]);
  }

  function switchTeam(id: string) {
    setActiveTeamId(id);
    alert(`Switched to team: ${id} (wire to session/team context)`);
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
              Teams
            </h1>
            <p className="text-sm text-zinc-500">
              Browse, switch, or create a team workspace.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={createTeam}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              + New team
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
                placeholder="Search teams…"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:max-w-sm"
              />
              <select
                className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}>
                <option value="ALL">Visibility: All</option>
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
            <select
              className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}>
              <option value="recent">Sort: Recent</option>
              <option value="alpha">Sort: A–Z</option>
              <option value="size">Sort: Members</option>
            </select>
          </div>

          {/* Grid */}
          <ul className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <li
                key={t.id}
                className="group rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/teams/${t.id}`}
                      className="text-sm font-semibold text-zinc-950 underline underline-offset-4 group-hover:opacity-90">
                      {t.name}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-[13px] text-zinc-600">
                      {t.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge>{t.visibility}</Badge>
                      <Badge>
                        {t.members} member{t.members === 1 ? '' : 's'}
                      </Badge>
                      <Badge>
                        {t.projects} project{t.projects === 1 ? '' : 's'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Updated</p>
                    <p className="text-xs font-medium text-zinc-700">
                      {new Date(t.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-[12px] text-zinc-600" />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => switchTeam(t.id)}
                      className={`inline-flex h-8 items-center justify-center rounded-lg border px-2 text-xs font-medium ${
                        activeTeamId === t.id
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50'
                      }`}>
                      {activeTeamId === t.id ? 'Active' : 'Switch'}
                    </button>
                    <Link
                      href={`/teams/${t.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium hover:bg-zinc-50">
                      Open
                    </Link>
                  </div>
                </div>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="col-span-full py-12 text-center text-sm text-zinc-500">
                No teams match your filters.
              </li>
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600">
      {children}
    </span>
  );
}
