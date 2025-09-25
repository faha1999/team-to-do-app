import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeamOverviewPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const user = await requireUser();

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
      projects: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!team || !team.members.some((member) => member.userId === user.id)) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title={team.name}
        description={team.description ?? "Shared context, permissions, and insights for this workspace."}
      />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">
          Members
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {team.members.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-black/5 bg-white/70 p-4 text-sm shadow-sm"
            >
              <p className="font-medium text-slate-900">{member.user.name ?? member.user.email}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">
          Projects
        </h2>
        {team.projects.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500">
            No shared projects yet. Create one from the projects tab and assign this team.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {team.projects.map((project) => (
              <div key={project.id} className="rounded-2xl border border-black/5 bg-white/80 p-5 shadow-sm">
                <p className="text-base font-semibold text-slate-900">{project.name}</p>
                {project.description ? (
                  <p className="mt-2 text-sm text-slate-600">{project.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
