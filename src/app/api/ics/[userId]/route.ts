import { format } from "date-fns";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const formatDate = (date: Date) => format(date, "yyyyMMdd'T'HHmmss'Z'");

export async function GET(_request: Request, context: unknown) {
  const { params } = context as { params: { userId: string } };

  const tasks = await prisma.task.findMany({
    where: {
      assigneeId: params.userId,
      dueDate: { not: null },
    },
    orderBy: { dueDate: "asc" },
    take: 250,
  });

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Team To-Do//EN",
    `X-WR-CALNAME:Tasks for ${params.userId}`,
  ];

  for (const task of tasks) {
    if (!task.dueDate) continue;
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${task.id}@team-to-do.local`);
    lines.push(`DTSTAMP:${formatDate(task.createdAt)}`);
    lines.push(`DTSTART:${formatDate(task.dueDate)}`);
    lines.push(`SUMMARY:${escapeText(task.title)}`);
    if (task.description) {
      lines.push(`DESCRIPTION:${escapeText(task.description)}`);
    }
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${params.userId}.ics"`,
    },
  });
}

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,");
}
