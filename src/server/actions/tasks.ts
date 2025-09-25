"use server";

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

import { ReminderChannel, TaskPriority, TaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  projectId: z.string().optional(),
  sectionId: z.string().optional(),
  dueDate: z.string().optional(),
  parentTaskId: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  reminders: z
    .array(
      z.object({
        remindAt: z.string(),
        channel: z.nativeEnum(ReminderChannel),
      })
    )
    .optional(),
});

export async function createTask(input: {
  title: string;
  description?: string | null;
  projectId?: string | null;
  sectionId?: string | null;
  dueDate?: string | null;
  parentTaskId?: string | null;
  priority?: TaskPriority | null;
  reminders?: { remindAt: string; channel: ReminderChannel }[];
}) {
  const user = await requireUser();
  const parsed = createTaskSchema.safeParse({
    title: input.title,
    description: input.description ?? undefined,
    projectId: input.projectId ?? undefined,
    sectionId: input.sectionId ?? undefined,
    dueDate: input.dueDate ?? undefined,
    parentTaskId: input.parentTaskId ?? undefined,
    priority: input.priority ?? undefined,
    reminders: input.reminders ?? undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid task data");
  }

  const dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined;
  const description = parsed.data.description?.trim();
  const reminders = parsed.data.reminders
    ?.map((reminder) => {
      const remindAt = new Date(reminder.remindAt);
      if (Number.isNaN(remindAt.getTime())) {
        return null;
      }
      return {
        remindAt,
        channel: reminder.channel,
      };
    })
    .filter(Boolean) as { remindAt: Date; channel: ReminderChannel }[] | undefined;

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      creatorId: user.id,
      description: description && description.length > 0 ? description : null,
      projectId: parsed.data.projectId,
      sectionId: parsed.data.sectionId,
      parentTaskId: parsed.data.parentTaskId ?? null,
      dueDate,
      assigneeId: user.id,
      priority: parsed.data.priority ?? undefined,
      reminders: reminders && reminders.length > 0 ? { create: reminders } : undefined,
    },
    include: {
      project: true,
      section: true,
    },
  });

  await prisma.taskAssignment.create({
    data: {
      taskId: task.id,
      userId: user.id,
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

  await prisma.taskAssignment.upsert({
    where: {
      taskId_userId: {
        taskId,
        userId: user.id,
      },
    },
    update: {},
    create: {
      taskId,
      userId: user.id,
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

const updateTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus),
  startDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  recurrenceRule: z.string().nullable().optional(),
  sectionId: z.string().nullable().optional(),
  assigneeIds: z.array(z.string()).optional(),
  labelIds: z.array(z.string()).optional(),
  reminders: z
    .array(
      z.object({
        id: z.string().optional(),
        remindAt: z.string(),
        channel: z.nativeEnum(ReminderChannel),
      })
    )
    .optional(),
  subtasks: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        status: z.nativeEnum(TaskStatus).optional(),
      })
    )
    .optional(),
});

export async function updateTask(input: z.input<typeof updateTaskSchema>) {
  await requireUser();
  const parsed = updateTaskSchema.parse(input);

  const task = await prisma.task.findUnique({
    where: { id: parsed.id },
    select: {
      id: true,
      projectId: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const startDate = parsed.startDate ? new Date(parsed.startDate) : null;
  const dueDate = parsed.dueDate ? new Date(parsed.dueDate) : null;

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: parsed.id },
      data: {
        title: parsed.title,
        description: parsed.description ?? null,
        priority: parsed.priority,
        status: parsed.status,
        startDate,
        dueDate,
        recurrenceRule: parsed.recurrenceRule ?? null,
        sectionId: parsed.sectionId ?? undefined,
        assigneeId: parsed.assigneeIds?.[0] ?? null,
      },
    });

    if (parsed.labelIds) {
      await tx.taskLabel.deleteMany({
        where: {
          taskId: parsed.id,
          labelId: { notIn: parsed.labelIds },
        },
      });

      const existingLabels = await tx.taskLabel.findMany({
        where: { taskId: parsed.id },
        select: { labelId: true },
      });

      const existingIds = new Set(existingLabels.map((l) => l.labelId));
      const toCreate = parsed.labelIds.filter((id) => !existingIds.has(id));

      if (toCreate.length > 0) {
        await tx.taskLabel.createMany({
          data: toCreate.map((labelId) => ({
            taskId: parsed.id,
            labelId,
          })),
        });
      }
    }

    if (parsed.assigneeIds) {
      const current = await tx.taskAssignment.findMany({
        where: { taskId: parsed.id },
      });

      const currentIds = new Set(current.map((assignment) => assignment.userId));
      const nextIds = new Set(parsed.assigneeIds);

      const toRemove = current
        .filter((assignment) => !nextIds.has(assignment.userId))
        .map((assignment) => assignment.userId);

      if (toRemove.length > 0) {
        await tx.taskAssignment.deleteMany({
          where: {
            taskId: parsed.id,
            userId: { in: toRemove },
          },
        });
      }

      const toAdd = parsed.assigneeIds.filter((id) => !currentIds.has(id));
      if (toAdd.length > 0) {
        await tx.taskAssignment.createMany({
          data: toAdd.map((userId) => ({ taskId: parsed.id, userId })),
        });
      }
    }

    if (parsed.reminders) {
      const incomingIds = parsed.reminders
        .map((reminder) => reminder.id)
        .filter((id): id is string => Boolean(id));

      await tx.reminder.deleteMany({
        where: {
          taskId: parsed.id,
          id: { notIn: incomingIds },
        },
      });

      for (const reminder of parsed.reminders) {
        const remindAt = new Date(reminder.remindAt);

        if (reminder.id) {
          await tx.reminder.update({
            where: { id: reminder.id },
            data: {
              remindAt,
              channel: reminder.channel,
            },
          });
        } else {
          await tx.reminder.create({
            data: {
              taskId: parsed.id,
              remindAt,
              channel: reminder.channel,
            },
          });
        }
      }
    }

    if (parsed.subtasks) {
      for (const subtask of parsed.subtasks) {
        await tx.task.update({
          where: { id: subtask.id },
          data: {
            title: subtask.title ?? undefined,
            status: subtask.status ?? undefined,
          },
        });
      }
    }
  });

  revalidatePath("/app");
  if (task.projectId) {
    revalidatePath(`/app/projects/${task.projectId}`);
    revalidatePath(`/app/projects/${task.projectId}/board`);
  }

  return { success: true } as const;
}

export async function uploadTaskAttachments(
  taskId: string,
  formData: FormData
) {
  await requireUser();

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const files = formData.getAll("files");
  if (files.length === 0) {
    return { success: true } as const;
  }

  const uploadDir = path.join(process.cwd(), "uploads", "tasks", taskId);
  await fs.mkdir(uploadDir, { recursive: true });

  const records: { fileName: string; filePath: string }[] = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = `${Date.now()}-${randomUUID()}-${file.name}`;
    const filePath = path.join(uploadDir, safeName);
    await fs.writeFile(filePath, buffer);

    records.push({
      fileName: file.name,
      filePath: path.relative(process.cwd(), filePath),
    });
  }

  if (records.length > 0) {
    await prisma.taskAttachment.createMany({
      data: records.map((record) => ({
        taskId,
        fileName: record.fileName,
        filePath: record.filePath,
      })),
    });
  }

  revalidatePath("/app");
  if (task.projectId) {
    revalidatePath(`/app/projects/${task.projectId}`);
  }

  return { success: true } as const;
}

export async function removeTaskAttachment(attachmentId: string) {
  await requireUser();

  const attachment = await prisma.taskAttachment.findUnique({
    where: { id: attachmentId },
    select: {
      id: true,
      filePath: true,
      task: {
        select: {
          id: true,
          projectId: true,
        },
      },
    },
  });

  if (!attachment) {
    throw new Error("Attachment not found");
  }

  await prisma.taskAttachment.delete({ where: { id: attachment.id } });

  const absolutePath = path.join(process.cwd(), attachment.filePath);
  await fs.rm(absolutePath, { force: true });

  revalidatePath("/app");
  if (attachment.task.projectId) {
    revalidatePath(`/app/projects/${attachment.task.projectId}`);
  }

  return { success: true } as const;
}
