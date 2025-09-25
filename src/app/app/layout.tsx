import type { Metadata } from "next";
import type { ReactNode } from "react";

import Sidebar from "@/components/nav/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { TaskDrawerProvider } from "@/components/task/TaskDrawerProvider";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addDays, startOfDay } from "date-fns";

export const metadata: Metadata = {
  title: "Workspace · Team To-Do",
  description: "Plan, prioritize, and execute with focus.",
};

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const todayStart = startOfDay(new Date());
  const tomorrowStart = addDays(todayStart, 1);

  let navigationCounts: undefined | {
    inbox: number;
    today: number;
    upcoming: number;
  };
  let projects: { id: string; name: string }[] = [];

  if (user) {
    const [inboxCount, todayCount, upcomingCount, projectRows] = await Promise.all([
      prisma.task.count({
        where: {
          creatorId: user.id,
          projectId: null,
          status: { not: "CANCELLED" },
        },
      }),
      prisma.task.count({
        where: {
          OR: [{ assigneeId: user.id }, { creatorId: user.id }],
          status: { in: ["OPEN", "IN_PROGRESS", "BLOCKED"] },
          dueDate: { gte: todayStart, lt: tomorrowStart },
        },
      }),
      prisma.task.count({
        where: {
          OR: [{ assigneeId: user.id }, { creatorId: user.id }],
          status: { in: ["OPEN", "IN_PROGRESS", "BLOCKED"] },
          dueDate: { gte: tomorrowStart },
        },
      }),
      prisma.project.findMany({
        where: {
          OR: [
            { ownerUserId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);

    navigationCounts = {
      inbox: inboxCount,
      today: todayCount,
      upcoming: upcomingCount,
    };
    projects = projectRows;
  }

  return (
    <TaskDrawerProvider>
      <div className="flex min-h-screen bg-[#fdf9f4] text-[#352c23]">
        <Sidebar user={user ?? undefined} counts={navigationCounts} projects={projects} />
        <div className="flex flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-white px-16 py-12">
            <div className="mx-auto max-w-3xl space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </TaskDrawerProvider>
  );
}
