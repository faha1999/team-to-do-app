import Link from "next/link";

import { PageHeader, EmptyState } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProject } from "@/server/actions/projects";

export default async function ProjectsPage() {
  const user = await requireUser();

  const [projects, teams] = await Promise.all([
    prisma.project.findMany({
      where: {
        OR: [
          { ownerUserId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      include: {
        team: true,
        members: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.team.findMany({
      where: {
        members: { some: { userId: user.id } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Projects"
        description="Personal and shared workstreams that keep your organisation aligned."
        actions={
          <form action={createProject} className="flex items-center gap-2 text-sm">
            <input
              type="text"
              name="name"
              required
              placeholder="New project name"
              className="rounded-xl border border-black/10 bg-white/80 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
            <select
              name="teamId"
              className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              defaultValue=""
            >
              <option value="">Personal</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
            >
              Create
            </button>
          </form>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Spin up a project to align conversations, tasks, and delivery milestones."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/app/projects/${project.id}`}
              className="group space-y-3 rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">{project.name}</h2>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {project.team ? project.team.name : "Personal"}
                </span>
              </div>
              {project.description ? (
                <p className="text-sm leading-relaxed text-slate-600">
                  {project.description}
                </p>
              ) : (
                <p className="text-sm text-slate-500">No description yet.</p>
              )}
              <footer className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-slate-400">
                <span>{project.members.length} member(s)</span>
                <span>Updated {project.updatedAt.toLocaleDateString()}</span>
              </footer>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
