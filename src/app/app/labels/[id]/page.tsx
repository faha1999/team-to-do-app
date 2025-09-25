import { notFound } from "next/navigation";

import { PageHeader, EmptyState } from "@/components/layout/PageHeader";
import { TaskItem } from "@/components/task/TaskItem";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LabelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const label = await prisma.label.findUnique({
    where: { id },
    include: {
      team: {
        include: {
          members: true,
        },
      },
      tasks: {
        include: {
          task: {
            include: {
              project: true,
              section: true,
            },
          },
        },
      },
    },
  });

  if (
    !label ||
    (label.team && !label.team.members.some((member) => member.userId === user.id))
  ) {
    notFound();
  }

  const tasks = label.tasks.map((taskLabel) => taskLabel.task);

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Label · ${label.name}`}
        description={
          label.team
            ? `Shared with ${label.team.name}`
            : "Personal label applied across your projects"
        }
      />

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Once tasks are tagged with this label, they will appear here for fast review."
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
