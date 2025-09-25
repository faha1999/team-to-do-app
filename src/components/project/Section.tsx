import type { ReactNode } from "react";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm shadow-black/5">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">
          {title}
        </h2>
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
