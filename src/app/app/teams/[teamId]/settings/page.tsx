import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeamSettingsPage({
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
      },
    },
  });

  if (!team) {
    notFound();
  }

  const membership = team.members.find((member) => member.userId === user.id);

  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Settings · ${team.name}`}
        description="Adjust naming, visibility, and member roles."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">
            Team details
          </h2>
          <p className="text-sm text-slate-600">
            Slug: <span className="font-mono text-slate-900">{team.slug}</span>
          </p>
          <p className="text-sm text-slate-600">
            Visibility: <strong>{team.visibility}</strong>
          </p>
        </div>
        <div className="space-y-3 rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">
            Members
          </h2>
          <ul className="space-y-2 text-sm text-slate-600">
            {team.members.map((member) => (
              <li key={member.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-3 py-2">
                <span>{member.user.name ?? member.user.email}</span>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{member.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
