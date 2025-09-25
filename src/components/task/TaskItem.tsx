import { format } from "date-fns";
import type { Task, Project, Section } from "@prisma/client";

export type TaskItemProps = {
  task: Task & {
    project?: Project | null;
    section?: Section | null;
  };
};

const statusTone: Record<Task["status"], string> = {
  OPEN: "bg-slate-200 text-slate-800",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  BLOCKED: "bg-amber-100 text-amber-700",
  DONE: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

export function TaskItem({ task }: TaskItemProps) {
  return (
    <article className="space-y-3 rounded-2xl border border-black/5 bg-white/80 p-5 shadow-sm shadow-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-base font-medium text-slate-900">{task.title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusTone[task.status]}`}>
          {task.status.replace(/_/g, " ")}
        </span>
      </header>
      {task.description ? (
        <p className="text-sm text-slate-600">{task.description}</p>
      ) : null}
      <footer className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
        {task.project ? <span>{task.project.name}</span> : <span>Personal</span>}
        {task.section ? <span>{task.section.name}</span> : null}
        {task.dueDate ? <span>Due {format(task.dueDate, "dd MMM")}</span> : null}
      </footer>
    </article>
  );
}
