import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";

import { PageHeader } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MonthCalendarPage() {
  const user = await requireUser();
  const start = startOfMonth(new Date());
  const end = endOfMonth(start);

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { assigneeId: user.id },
        { creatorId: user.id },
      ],
      dueDate: {
        gte: start,
        lte: end,
      },
    },
    include: {
      project: true,
    },
  });

  const days = eachDayOfInterval({ start, end });

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Calendar · ${format(start, "MMMM yyyy")}`}
        description="High-level view to plan sprints, releases, and personal priorities."
      />
      <div className="grid gap-3 rounded-2xl border border-black/5 bg-white/70 p-6 shadow-inner shadow-black/5">
        <div className="grid grid-cols-7 gap-3">
          {days.map((day) => {
            const daily = tasks.filter((task) =>
              task.dueDate && format(task.dueDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
            );
            return (
              <div key={day.toISOString()} className="space-y-2 rounded-xl border border-black/5 bg-white/80 p-3 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>{format(day, "dd")}</span>
                  <span className="uppercase tracking-[0.3em] text-slate-400">
                    {format(day, "EEE")}
                  </span>
                </div>
                <ul className="space-y-2">
                  {daily.map((task) => (
                    <li key={task.id} className="rounded-lg border border-black/5 bg-white px-2 py-1 text-xs text-slate-700">
                      {task.title}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
