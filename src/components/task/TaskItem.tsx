"use client";

import { useState } from "react";

import { format, isBefore, startOfDay } from "date-fns";
import type { Task, Project, Section } from "@prisma/client";

import { useTaskDrawer } from "@/components/task/TaskDrawerProvider";

export type TaskItemProps = {
  task: Task & {
    project?: Project | null;
    section?: Section | null;
    subtasks?: Array<Pick<Task, "id" | "title" | "status" | "order" | "dueDate">>;
  };
};

export function TaskItem({ task }: TaskItemProps) {
  const { openTask } = useTaskDrawer();
  const [expanded, setExpanded] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    openTask(task.id, event.currentTarget);
  };

  const hasSubtasks = Boolean(task.subtasks && task.subtasks.length > 0);
  const completedSubtasks = task.subtasks?.filter((subtask) => subtask.status === "DONE").length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate ? isBefore(dueDate, startOfDay(new Date())) : false;
  const formattedDueDate = dueDate ? format(dueDate, "d MMM") : null;
  const statusCircleTone = (() => {
    if (task.status === "DONE") return "bg-[#d4522f] border-[#d4522f] text-white";
    if (task.status === "CANCELLED") return "border-[#e0d6c9] text-[#c8b8a6]";
    return "border-[#d9cbb9] text-transparent";
  })();

  const toggleSubtasks = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setExpanded((current) => !current);
  };

  return (
    <div className="group">
      <div className="flex items-start gap-2 px-3 py-3">
        {hasSubtasks ? (
          <button
            type="button"
            onClick={toggleSubtasks}
            className="mt-1 grid h-5 w-5 place-items-center rounded-full border border-transparent text-[#a18f7c] transition hover:bg-[#fdf4ec] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c64c2b]"
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse subtasks" : "Expand subtasks"}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 5 6 7-6 7" />
            </svg>
          </button>
        ) : (
          <span className="mt-1 h-5 w-5" aria-hidden />
        )}

        <button
          type="button"
          onClick={handleClick}
          className="flex w-full items-start gap-3 rounded-md px-2 py-1 text-left transition hover:bg-[#fdf4ec] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c64c2b]"
        >
          <span
            className={`mt-1 grid h-5 w-5 place-items-center rounded-full border text-[0.65rem] font-semibold ${statusCircleTone}`}
            aria-hidden
          >
            {task.status === "DONE" ? (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 12 4 4 8-8" />
              </svg>
            ) : null}
          </span>
          <span className="flex-1 space-y-1">
            <p className="text-sm font-medium text-[#3c2f23] group-hover:text-[#d4522f]">
              {task.title}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#a18f7c]">
              {totalSubtasks > 0 ? (
                <span className="inline-flex items-center gap-1 text-[#8f7f6f]">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 6h10" />
                    <path d="M5 12h14" />
                    <path d="M5 18h6" />
                  </svg>
                  {completedSubtasks}/{totalSubtasks}
                </span>
              ) : null}
              {task.project ? (
                <span className="inline-flex items-center gap-1 text-[#8f7f6f]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d4522f]" aria-hidden />
                  {task.project.name}
                </span>
              ) : null}
              {task.section ? (
                <span className="inline-flex items-center gap-1 text-[#b39f8a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#cba679]" aria-hidden />
                  {task.section.name}
                </span>
              ) : null}
              {formattedDueDate ? (
                <span className={`inline-flex items-center gap-1 font-semibold ${isOverdue ? "text-[#d4522f]" : "text-[#c64c2b]"}`}>
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
                    <rect x={4} y={5} width={16} height={14} rx={2.5} />
                    <path d="M8 3.5v3" />
                    <path d="M16 3.5v3" />
                  </svg>
                  {formattedDueDate}
                </span>
              ) : null}
            </div>
          </span>
        </button>
      </div>

      {hasSubtasks && expanded ? (
        <ul className="ml-9 border-l border-dashed border-[#eadfd0] pl-5">
          {task.subtasks!.map((subtask, index) => {
            const isDone = subtask.status === "DONE";
            return (
              <li key={subtask.id} className="flex items-start gap-3 py-2">
                <span
                  className={`mt-1 grid h-4 w-4 place-items-center rounded-full border text-[0.6rem] font-semibold ${
                    isDone ? "border-[#d4522f] bg-[#d4522f] text-white" : "border-[#d9cbb9]"
                  }`}
                  aria-hidden
                >
                  {isDone ? (
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="h-2.5 w-2.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 12 4 4 8-8" />
                    </svg>
                  ) : null}
                </span>
                <span
                  className={`flex-1 text-sm ${
                    isDone ? "text-[#c8b8a6] line-through" : "text-[#4b3f35]"
                  }`}
                >
                  {index + 1}. {subtask.title}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
