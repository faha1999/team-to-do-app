import Link from "next/link";

import { PageHeader, EmptyState } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTeam } from "@/server/actions/teams";

export default async function TeamsPage() {
  const user = await requireUser();
  const teams = await prisma.team.findMany({
    where: {
      members: { some: { userId: user.id } },
    },
    include: {
      members: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-10">
      <PageHeader
        title="Teams"
        description="Create focused collaboration spaces and manage membership with clarity."
        actions={
          <form action={createTeam} className="flex items-center gap-2 text-sm">
            <input
              name="name"
              required
              placeholder="New team"
              className="rounded-xl border border-black/10 bg-white/80 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
            >
              Create
            </button>
          </form>
        }
      />

      {teams.length === 0 ? (
        <EmptyState
          title="No teams yet"
          description="Spin up a team to unlock shared roadmaps, access control, and activity transparency."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/app/teams/${team.id}`}
              className="group space-y-3 rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">{team.name}</h2>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {team.members.length} member(s)
                </span>
              </div>
              {team.description ? (
                <p className="text-sm leading-relaxed text-slate-600">{team.description}</p>
              ) : (
                <p className="text-sm text-slate-500">No description yet.</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
