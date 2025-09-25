import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type UserOption = {
  id: string;
  name: string | null;
  email: string | null;
};

function uniqueBy<T, K>(items: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  const result: T[] = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export async function GET(_request: Request, context: unknown) {
  const { params } = context as { params: { taskId: string } };
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const task = await prisma.task.findUnique({
    where: { id: params.taskId },
    include: {
      project: {
        include: {
          team: {
            include: {
              members: {
                include: { user: true },
              },
            },
          },
          members: {
            include: { user: true },
          },
        },
      },
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      labels: {
        include: {
          label: true,
        },
      },
      reminders: true,
      attachments: true,
      subtasks: {
        include: {
          assignments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const teamMembers = task.project?.team?.members ?? [];
  const projectMembers = task.project?.members ?? [];
  const creator = await prisma.user.findUnique({
    where: { id: task.creatorId },
    select: { id: true, name: true, email: true },
  });

  const userCandidates: UserOption[] = [
    ...teamMembers.map((member) => member.user),
    ...projectMembers.map((member) => member.user),
  ];

  if (creator) {
    userCandidates.push(creator);
  }

  const availableUsers = uniqueBy(userCandidates, (user) => user.id);

  const teamId = task.project?.teamId ?? null;

  const availableLabels = await prisma.label.findMany({
    where: teamId
      ? {
          OR: [
            { teamId },
            { teamId: null },
          ],
        }
      : { teamId: null },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    task,
    availableUsers,
    availableLabels,
  });
}
