export type TaskItemProps = {
  title: string;
  status?: string;
  dueDate?: string;
};

export function TaskItem({ title, status = "open", dueDate }: TaskItemProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <h3 className="text-sm font-medium text-slate-900">{title}</h3>
      <div className="mt-2 text-xs text-slate-500">
        <span>Status: {status}</span>
        {dueDate ? <span className="ml-3">Due: {dueDate}</span> : null}
      </div>
    </article>
  );
}
