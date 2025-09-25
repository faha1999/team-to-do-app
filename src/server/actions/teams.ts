"use server";

import slugify from "slugify";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createTeamSchema = z.object({
  name: z.string().min(2, "Team name is required"),
  description: z.string().optional(),
});

export async function createTeam(formData: FormData) {
  const user = await requireUser();
  const parsed = createTeamSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Unable to create team");
  }

  const baseSlug = slugify(parsed.data.name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.team.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  await prisma.team.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      slug,
      members: {
        create: [{ userId: user.id, role: "OWNER" }],
      },
    },
  });

  revalidatePath("/app/teams");
}
