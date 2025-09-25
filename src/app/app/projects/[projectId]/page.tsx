import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { QuickAdd } from "@/components/task/QuickAdd";
import { TaskItem } from "@/components/task/TaskItem";
import { Section } from "@/components/project/Section";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProjectListView({
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
      sections: {
        orderBy: { position: "asc" },
      },
      tasks: {
        include: {
          section: true,
          project: true,
        },
        orderBy: [{ sectionId: "asc" }, { order: "asc" }],
      },
      members: {
        where: { userId: user.id },
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

  const tasksBySection = new Map<string | null, typeof project.tasks>();
  for (const task of project.tasks) {
    const key = task.sectionId ?? null;
    const list = tasksBySection.get(key) ?? [];
    list.push(task);
    tasksBySection.set(key, list);
  }

  const defaultSectionId = project.sections[0]?.id;

  return (
    <div className="space-y-10">
      <PageHeader
        title={project.name}
        description={project.description ?? "Structured space to co-ordinate work."}
        actions={
          <QuickAdd
            userId={user.id}
            projectId={project.id}
            sectionId={defaultSectionId ?? undefined}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {project.sections.map((section) => (
          <Section key={section.id} title={section.name}>
            {(tasksBySection.get(section.id) ?? []).map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </Section>
        ))}
        {tasksBySection.get(null)?.length ? (
          <Section title="Ungrouped">
            {tasksBySection.get(null)!.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </Section>
        ) : null}
      </div>
    </div>
  );
}
