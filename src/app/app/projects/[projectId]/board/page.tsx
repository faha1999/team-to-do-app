import { notFound } from "next/navigation";

import { BoardColumn } from "@/components/project/BoardColumn";
import { TaskItem } from "@/components/task/TaskItem";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const columns = [
  { key: "OPEN" as const, label: "Queued" },
  { key: "IN_PROGRESS" as const, label: "In progress" },
  { key: "BLOCKED" as const, label: "Blocked" },
  { key: "DONE" as const, label: "Done" },
];

export default async function ProjectBoardView({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { where: { userId: user.id } },
      tasks: {
        include: {
          project: true,
          section: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const isPersonalOwner = project.ownerUserId === user.id;
  const isMember = isPersonalOwner || project.members.length > 0;

  if (!isMember) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Board · ${project.name}`}
        description="Kanban view to monitor flow, unblock work, and celebrate ships."
      />

      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <BoardColumn key={column.key} title={column.label}>
            {project.tasks
              .filter((task) => task.status === column.key)
              .map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
          </BoardColumn>
        ))}
      </div>
    </div>
  );
}
