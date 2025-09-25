import { format, isBefore, isSameDay, startOfDay } from "date-fns";

import { PageHeader } from "@/components/layout/PageHeader";
import { QuickAdd } from "@/components/task/QuickAdd";
import { TaskItem } from "@/components/task/TaskItem";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TodayPage() {
  const user = await requireUser();
  const todayStart = startOfDay(new Date());

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { assigneeId: user.id },
        { creatorId: user.id },
      ],
      status: { in: ["OPEN", "IN_PROGRESS", "BLOCKED"] },
    },
    include: {
      project: true,
      section: true,
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
  });

  const overdue = tasks.filter(
    (task) => task.dueDate && isBefore(task.dueDate, todayStart)
  );
  const dueToday = tasks.filter((task) =>
    task.dueDate ? isSameDay(task.dueDate, todayStart) : false
  );
  const unscheduled = tasks.filter((task) => !task.dueDate);

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Today · ${format(todayStart, "EEEE, dd MMMM")}`}
        description="Review priorities, capture new work, and move key initiatives forward."
        actions={<QuickAdd />}
      />

      {overdue.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-rose-500">
            Overdue
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {overdue.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">
          Due today
        </h2>
        {dueToday.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500">
            No tasks scheduled for today. Capture new commitments or pull from upcoming.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {dueToday.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">
          Unscheduled
        </h2>
        {unscheduled.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500">
            Everything is scheduled. Great job staying ahead.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {unscheduled.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
