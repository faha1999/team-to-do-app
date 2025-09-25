import { notFound } from "next/navigation";

import { PageHeader, EmptyState } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeamProjectsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const user = await requireUser();

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: true,
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
        title={`Projects · ${team.name}`}
        description="All shared projects within this team."
      />

      {team.projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create a project from the Projects tab and assign it to this team to collaborate together."
        />
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
    </div>
  );
}
