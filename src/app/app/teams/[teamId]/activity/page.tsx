import { notFound } from "next/navigation";

import { PageHeader, EmptyState } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeamActivityPage({
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
    },
  });

  if (!team || !team.members.some((member) => member.userId === user.id)) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Activity · ${team.name}`}
        description="An audit-ready log of key events—publishing soon."
      />
      <EmptyState
        title="Activity feed coming soon"
        description="Track project updates, role changes, and comment threads here."
      />
    </div>
  );
}
