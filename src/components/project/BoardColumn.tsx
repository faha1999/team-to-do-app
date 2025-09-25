import type { ReactNode } from "react";

export function BoardColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="flex w-72 flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
        {title}
      </h3>
      <div className="flex flex-1 flex-col gap-2">{children}</div>
    </article>
  );
}
