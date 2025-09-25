import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eadfd0] pb-5">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-[#3c2f23]">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-[#8f7f6f]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2 text-sm text-[#7a6757]">{actions}</div> : null}
    </header>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-xl border border-dashed border-[#eadfd0] bg-[#fdf9f4] px-10 py-12 text-center">
      <h2 className="text-base font-semibold text-[#3c2f23]">{title}</h2>
      <p className="text-sm leading-relaxed text-[#8f7f6f]">{description}</p>
      {action}
    </div>
  );
}
