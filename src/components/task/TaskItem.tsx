"use client";

import { format, isBefore, startOfDay } from "date-fns";
import type { Task, Project, Section } from "@prisma/client";

import { useTaskDrawer } from "@/components/task/TaskDrawerProvider";

export type TaskItemProps = {
  task: Task & {
    project?: Project | null;
    section?: Section | null;
  };
};

export function TaskItem({ task }: TaskItemProps) {
  const { openTask } = useTaskDrawer();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    openTask(task.id, event.currentTarget);
  };

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate ? isBefore(dueDate, startOfDay(new Date())) : false;
  const formattedDueDate = dueDate ? format(dueDate, "d MMM") : null;
  const statusCircleTone = (() => {
    if (task.status === "DONE") return "bg-[#d6eadf] border-transparent";
    if (task.status === "CANCELLED") return "border-[#e0d6c9]";
    return "border-[#d9cbb9]";
  })();

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex w-full items-start justify-between gap-4 rounded-md px-4 py-3 text-left transition hover:bg-[#fdf4ec] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c64c2b]"
    >
      <span
        className={`mt-1 grid h-5 w-5 place-items-center rounded-full border text-[0.65rem] font-semibold text-[#d4522f] ${statusCircleTone}`}
        aria-hidden
      >
        {task.status === "DONE" ? "✔" : ""}
      </span>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-[#3c2f23] group-hover:text-[#d4522f]">
          {task.title}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#a18f7c]">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4522f]" aria-hidden />
            {task.project ? task.project.name : "Personal"}
          </span>
          {task.section ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#cba679]" aria-hidden />
              {task.section.name}
            </span>
          ) : null}
          {formattedDueDate ? (
            <span
              className={`inline-flex items-center gap-1 px-0 py-0 font-semibold ${
                isOverdue ? "text-[#d4522f]" : "text-[#7a6757]"
              }`}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x={4.5} y={5} width={15} height={14} rx={2.5} />
                <path d="M8 3.5v3" />
                <path d="M16 3.5v3" />
              </svg>
              {formattedDueDate}
            </span>
          ) : null}
        </div>
        {task.description ? (
          <p className="text-xs leading-relaxed text-[#8f7f6f]">{task.description}</p>
        ) : null}
      </div>
    </button>
  );
}
