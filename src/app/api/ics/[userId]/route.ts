// src/app/api/ics/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Lightweight ICS feed for a user's tasks
 * - GET /api/ics/:userId
 * - Pulls tasks (due date or start/end) and emits VEVENTs
 * - No external services; pure text/calendar
 */

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } },
) {
  const userId = params.userId;

  // Fetch upcoming tasks (e.g., last 30 days past due + next 180 days)
  const now = new Date();
  const past = new Date(now);
  past.setDate(past.getDate() - 30);
  const future = new Date(now);
  future.setDate(future.getDate() + 180);

  // Adjust these fields to your Task model names
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      OR: [
        { dueDate: { gte: past, lte: future } },
        { startAt: { gte: past, lte: future } },
      ],
      // Example: exclude cancelled
      status: { not: 'CANCELLED' as any },
    },
    orderBy: [{ dueDate: 'asc' }, { startAt: 'asc' }],
    select: {
      id: true,
      title: true,
      description: true,
      dueDate: true, // Date
      startAt: true, // Date
      endAt: true, // Date
      project: { select: { name: true } },
      updatedAt: true,
    },
  });

  const lines: string[] = [];
  const prodId = '-//team-to-do//ics//EN';

  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push(`PRODID:${prodId}`);
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');

  for (const t of tasks) {
    const dtstamp = toICSDateTime(t.updatedAt ?? new Date());
    const uid = `${t.id}@team-to-do`;
    const summary = escapeICS(t.title || 'Task');
    const desc = escapeICS(t.description || '');
    const project = t.project?.name ? ` [${t.project.name}]` : '';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);

    if (t.startAt || t.endAt) {
      // Timed event
      if (t.startAt) lines.push(`DTSTART:${toICSDateTime(t.startAt)}`);
      if (t.endAt) lines.push(`DTEND:${toICSDateTime(t.endAt)}`);
    } else if (t.dueDate) {
      // All-day due date
      lines.push(`DTSTART;VALUE=DATE:${toICSDate(t.dueDate)}`);
      // For all-day ICS, DTEND is usually exclusive next day
      const next = new Date(t.dueDate);
      next.setDate(next.getDate() + 1);
      lines.push(`DTEND;VALUE=DATE:${toICSDate(next)}`);
    }

    lines.push(`SUMMARY:${summary}${project}`);
    if (desc) lines.push(`DESCRIPTION:${desc}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  const body = lines.join('\r\n');
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="tasks-${userId}.ics"`,
      'Cache-Control': 'no-store',
    },
  });
}

// Helpers
function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function toICSDate(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(
    date.getUTCDate(),
  )}`;
}
function toICSDateTime(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(
    date.getUTCDate(),
  )}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(
    date.getUTCSeconds(),
  )}Z`;
}
function escapeICS(s: string) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}
