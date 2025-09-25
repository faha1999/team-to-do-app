import { requireUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function createTask(input: {
  title: string;
  projectId?: string;
}) {
  const user = await requireUser();
  // TODO: persist task via Prisma.
  await logActivity({
    id: `task_${Date.now()}`,
    actorId: user.id,
    entityType: "task",
    entityId: "pending",
    action: "create",
    occurredAt: new Date(),
  });
  return { id: "pending", ...input };
}

export async function completeTask(taskId: string) {
  const user = await requireUser();
  await logActivity({
    id: `task_${taskId}_complete`,
    actorId: user.id,
    entityType: "task",
    entityId: taskId,
    action: "complete",
    occurredAt: new Date(),
  });
}
