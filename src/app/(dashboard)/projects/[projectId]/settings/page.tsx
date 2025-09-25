// src/app/(dashboard)/projects/[projectId]/settings/page.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Visibility = 'PUBLIC' | 'PRIVATE';
type ProjectRole = 'ADMIN' | 'EDITOR' | 'COMMENTER' | 'VIEWER';

type Member = { id: string; name: string; role: ProjectRole };

export default function ProjectSettingsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;

  // Demo state (wire to Server Actions/Prisma later)
  const [name, setName] = useState('Core Platform');
  const [description, setDescription] = useState(
    'Backend, APIs, auth, and infra.',
  );
  const [visibility, setVisibility] = useState<Visibility>('PUBLIC');
  const [members, setMembers] = useState<Member[]>([
    { id: 'u1', name: 'You', role: 'ADMIN' },
    { id: 'u2', name: 'Fahad', role: 'EDITOR' },
    { id: 'u3', name: 'Amira', role: 'COMMENTER' },
  ]);

  const roles: ProjectRole[] = ['ADMIN', 'EDITOR', 'COMMENTER', 'VIEWER'];

  const canDemoteSelf = useMemo(
    () => members.find((m) => m.id === 'u1')?.role !== 'VIEWER',
    [members],
  );

  function saveMeta() {
    alert('Saved metadata (hook this to a Server Action).');
  }
  function addMember() {
    const name = prompt('Member name?');
    if (!name) return;
    setMembers((xs) => [
      ...xs,
      { id: crypto.randomUUID(), name, role: 'VIEWER' },
    ]);
  }
  function changeRole(id: string, role: ProjectRole) {
    setMembers((xs) => xs.map((m) => (m.id === id ? { ...m, role } : m)));
  }
  function removeMember(id: string) {
    if (!confirm('Remove member from project?')) return;
    setMembers((xs) => xs.filter((m) => m.id !== id));
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

      <section className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
              Project — {projectId} · Settings
            </h1>
            <p className="text-sm text-zinc-500">
              Manage metadata, visibility, and member roles & permissions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
              ← Back to project
            </Link>
          </div>
        </div>

        {/* Settings card */}
        <div className="space-y-6">
          {/* Metadata */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
            <div className="border-b border-zinc-200 bg-zinc-50/60 px-4 py-3">
              <h2 className="text-sm font-semibold text-zinc-900">
                Project metadata
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Name, description, and visibility.
              </p>
            </div>
            <div className="grid gap-4 p-4">
              <label className="grid gap-1">
                <span className="text-sm font-medium text-zinc-800">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-zinc-800">
                  Description
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-zinc-800">
                  Visibility
                </span>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as Visibility)}
                  className="h-10 rounded-lg border border-zinc-200 bg-white px-2 text-sm">
                  <option value="PUBLIC">
                    Public (team can browse & join)
                  </option>
                  <option value="PRIVATE">
                    Private (invited members only)
                  </option>
                </select>
              </label>

              <div className="flex justify-end">
                <button
                  onClick={saveMeta}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-black">
                  Save changes
                </button>
              </div>
            </div>
          </div>

          {/* Members & roles */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/60 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">
                  Members & roles
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Admins can manage access and permissions.
                </p>
              </div>
              <button
                onClick={addMember}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
                + Add member
              </button>
            </div>

            <ul className="divide-y divide-zinc-100">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {m.name}
                    </p>
                    <p className="text-[12px] text-zinc-500">User ID: {m.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={m.role}
                      onChange={(e) =>
                        changeRole(m.id, e.target.value as ProjectRole)
                      }
                      className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm">
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeMember(m.id)}
                      disabled={m.id === 'u1' && !canDemoteSelf}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
              {members.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-zinc-500">
                  No members yet.
                </li>
              )}
            </ul>
          </div>

          {/* Danger zone */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
            <div className="border-b border-zinc-200 bg-zinc-50/60 px-4 py-3">
              <h2 className="text-sm font-semibold text-zinc-900">
                Danger zone
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Archive or delete this project.
              </p>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <button
                onClick={() => alert('Project archived')}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50">
                Archive project
              </button>
              <button
                onClick={() =>
                  confirm('Delete project? This cannot be undone.') &&
                  alert('Project deleted')
                }
                className="inline-flex h-10 items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-900">
                Delete project
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
