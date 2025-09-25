import type { ReactNode } from "react";

export function BoardColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="flex w-80 flex-col gap-3 rounded-2xl border border-black/10 bg-white/70 p-5 shadow-inner shadow-black/5 backdrop-blur">
      <h3 className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500">
        {title}
      </h3>
      <div className="flex flex-1 flex-col gap-3">{children}</div>
    </article>
  );
}
