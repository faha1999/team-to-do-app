import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireUser();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      team: true,
      members: {
        include: { user: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const canManage = project.ownerUserId === user.id || project.members.some((member) => member.userId === user.id && member.role === "ADMIN");
  if (!canManage) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Settings · ${project.name}`}
        description="Adjust visibility, ownership, and collaboration preferences."
      />

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">
            Visibility
          </h2>
          <p className="text-sm text-slate-600">
            {project.visibility === "PUBLIC"
              ? "Visible to everyone in the workspace."
              : project.team
              ? `Restricted to members of ${project.team.name}.`
              : "Private to you and invited collaborators."}
          </p>
        </div>
        <div className="space-y-3 rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">
            Collaborators
          </h2>
          <ul className="space-y-2 text-sm text-slate-600">
            {project.members.map((member) => (
              <li key={member.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-3 py-2">
                <span>{member.user.name ?? member.user.email}</span>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{member.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
