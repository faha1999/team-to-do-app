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
      subtasks: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          status: true,
          order: true,
          dueDate: true,
        },
      },
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
    <div className="space-y-8">
      <PageHeader
        title={`Today · ${format(todayStart, "EEEE, dd MMMM")}`}
        description="Review priorities, capture new work, and move key initiatives forward."
        actions={<QuickAdd userId={user.id} />}
      />

      {overdue.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-[#d4522f]">
            Overdue
          </h2>
          <div className="rounded-xl border border-[#eadfd0] bg-white">
            <ul className="divide-y divide-[#f0e3d4]">
              {overdue.map((task) => (
                <li key={task.id}>
                  <TaskItem task={task} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-[#8f7f6f]">
          Due today
        </h2>
        {dueToday.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#eadfd0] bg-[#fdf9f4] px-6 py-8 text-sm text-[#8f7f6f]">
            No tasks scheduled for today. Capture new commitments or pull from upcoming.
          </p>
        ) : (
          <div className="rounded-xl border border-[#eadfd0] bg-white">
            <ul className="divide-y divide-[#f0e3d4]">
              {dueToday.map((task) => (
                <li key={task.id}>
                  <TaskItem task={task} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-[#8f7f6f]">
          Unscheduled
        </h2>
        {unscheduled.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#eadfd0] bg-[#fdf9f4] px-6 py-8 text-sm text-[#8f7f6f]">
            Everything is scheduled. Great job staying ahead.
          </p>
        ) : (
          <div className="rounded-xl border border-[#eadfd0] bg-white">
            <ul className="divide-y divide-[#f0e3d4]">
              {unscheduled.map((task) => (
                <li key={task.id}>
                  <TaskItem task={task} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
