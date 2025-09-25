import type { ReactNode } from "react";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </header>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
