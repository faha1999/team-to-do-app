"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createProjectSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  description: z.string().optional(),
  teamId: z.string().optional(),
});

export async function createProject(formData: FormData) {
  const user = await requireUser();
  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
    teamId: formData.get("teamId") ?? undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Unable to create project");
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      teamId: parsed.data.teamId,
      ownerUserId: parsed.data.teamId ? null : user.id,
      members: {
        create: [
          {
            userId: user.id,
            role: parsed.data.teamId ? "ADMIN" : "ADMIN",
          },
        ],
      },
    },
  });

  await prisma.section.create({
    data: {
      projectId: project.id,
      name: "Backlog",
      position: 0,
    },
  });

  revalidatePath("/app/projects");
  revalidatePath(`/app/projects/${project.id}`);

  redirect(`/app/projects/${project.id}`);
}
