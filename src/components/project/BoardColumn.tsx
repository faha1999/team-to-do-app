import type { ReactNode } from "react";

export function BoardColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="flex w-80 min-w-[18rem] flex-col gap-3 rounded-xl border border-[#eadfd0] bg-white px-4 py-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.4em] text-[#8f7f6f]">
        {title}
      </h3>
      <div className="flex flex-1 flex-col divide-y divide-[#f0e3d4]">{children}</div>
    </article>
  );
}
