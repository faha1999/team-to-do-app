import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ projects: [] }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerUserId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return NextResponse.json({
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
    })),
  });
}
