"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  projectId: z.string().optional(),
  sectionId: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function createTask(input: {
  title: string;
  projectId?: string | null;
  sectionId?: string | null;
  dueDate?: string | null;
}) {
  const user = await requireUser();
  const parsed = createTaskSchema.safeParse({
    title: input.title,
    projectId: input.projectId ?? undefined,
    sectionId: input.sectionId ?? undefined,
    dueDate: input.dueDate ?? undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid task data");
  }

  const dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined;

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      creatorId: user.id,
      projectId: parsed.data.projectId,
      sectionId: parsed.data.sectionId,
      dueDate,
    },
    include: {
      project: true,
      section: true,
    },
  });

  revalidatePath("/app");
  if (task.projectId) {
    revalidatePath(`/app/projects/${task.projectId}`);
  }

  return task;
}

export async function completeTask(taskId: string) {
  const user = await requireUser();

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "DONE",
      completedAt: new Date(),
      assigneeId: user.id,
    },
  });

  revalidatePath("/app");
}

export async function reopenTask(taskId: string) {
  await requireUser();

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "IN_PROGRESS",
      completedAt: null,
    },
  });

  revalidatePath("/app");
}
