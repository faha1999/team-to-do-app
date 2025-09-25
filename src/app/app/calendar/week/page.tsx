import { addDays, eachDayOfInterval, format, startOfWeek } from "date-fns";

import { PageHeader } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function WeekCalendarPage() {
  const user = await requireUser();
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = addDays(start, 6);

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
      section: true,
    },
    orderBy: { dueDate: "asc" },
  });

  const days = eachDayOfInterval({ start, end });

  return (
    <div className="space-y-10">
      <PageHeader
        title="Calendar · Week"
        description="Plot upcoming commitments and make sure workload is balanced." />
      <div className="grid gap-4 rounded-2xl border border-black/5 bg-white/70 p-6 shadow-inner shadow-black/5">
        <div className="grid gap-6 lg:grid-cols-7">
          {days.map((day) => {
            const daily = tasks.filter((task) =>
              task.dueDate && format(task.dueDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
            );
            return (
              <div key={day.toISOString()} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    {format(day, "EEE")}
                  </p>
                  <span className="text-sm font-medium text-slate-900">{format(day, "dd")}</span>
                </div>
                <div className="space-y-2">
                  {daily.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-3 py-2 text-xs text-slate-500">
                      No tasks
                    </p>
                  ) : (
                    daily.map((task) => (
                      <p
                        key={task.id}
                        className="rounded-xl border border-black/5 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm"
                      >
                        {task.title}
                      </p>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
