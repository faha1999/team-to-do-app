import { addDays, eachDayOfInterval, format, startOfDay } from "date-fns";

import { PageHeader, EmptyState } from "@/components/layout/PageHeader";
import { TaskItem } from "@/components/task/TaskItem";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function UpcomingPage() {
  const user = await requireUser();
  const today = startOfDay(new Date());
  const horizon = addDays(today, 14);

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { assigneeId: user.id },
        { creatorId: user.id },
      ],
      dueDate: {
        gt: today,
        lte: horizon,
      },
    },
    include: {
      project: true,
      section: true,
    },
    orderBy: { dueDate: "asc" },
  });

  const days = eachDayOfInterval({ start: today, end: horizon });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Upcoming"
        description="A rolling 14-day view to balance capacity and stay ahead of deadlines."
      />

      {tasks.length === 0 ? (
        <EmptyState
          title="Nothing on the horizon"
          description="Assign due dates to see work plotted across the next two weeks."
        />
      ) : (
        <div className="space-y-8">
          {days.map((day) => {
            const dailyTasks = tasks.filter(
              (task) => task.dueDate && format(task.dueDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
            );

            if (dailyTasks.length === 0) return null;

            return (
              <section key={day.toISOString()} className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-[#8f7f6f]">
                  {format(day, "EEEE • dd MMM")}
                </h2>
                <div className="rounded-xl border border-[#eadfd0] bg-white">
                  <ul className="divide-y divide-[#f0e3d4]">
                    {dailyTasks.map((task) => (
                      <li key={task.id}>
                        <TaskItem task={task} />
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
