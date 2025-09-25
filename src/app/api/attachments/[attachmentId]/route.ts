import { promises as fs } from "fs";
import path from "path";

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: unknown) {
  const { params } = context as { params: { attachmentId: string } };
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const attachment = await prisma.taskAttachment.findUnique({
    where: { id: params.attachmentId },
    include: {
      task: {
        select: {
          projectId: true,
        },
      },
    },
  });

  if (!attachment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const absolutePath = path.join(process.cwd(), attachment.filePath);

  try {
    const file = await fs.readFile(absolutePath);
    return new NextResponse(file as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${attachment.fileName}"`,
      },
    });
  } catch (error) {
    console.error("Attachment read error", error);
    return NextResponse.json({ error: "Failed to read attachment" }, { status: 500 });
  }
}
