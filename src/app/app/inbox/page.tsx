import { PageHeader, EmptyState } from "@/components/layout/PageHeader";
import { TaskItem } from "@/components/task/TaskItem";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function InboxPage() {
  const user = await requireUser();

  const tasks = await prisma.task.findMany({
    where: {
      creatorId: user.id,
      projectId: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      project: true,
      section: true,
    },
  });

  return (
    <div className="space-y-10">
      <PageHeader
        title="Inbox"
        description="Capture everything quickly. Clarify, prioritize, and dispatch when you are ready."
      />

      {tasks.length === 0 ? (
        <EmptyState
          title="Zero inbox, zero stress"
          description="The moment something comes to mind, drop it here. We'll keep it safe until you schedule it."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
