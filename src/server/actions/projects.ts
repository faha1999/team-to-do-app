import { requireUser } from "@/lib/auth";

export async function createProject(input: {
  name: string;
  teamId?: string;
}) {
  const user = await requireUser();
  // TODO: persist project via Prisma.
  return { id: `project_${Date.now()}`, ownerId: user.id, ...input };
}

export async function archiveProject(projectId: string) {
  await requireUser();
  // TODO: set project status to archived.
  return { ok: true, projectId };
}
