import type { ReactNode } from "react";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-[#eadfd0] bg-white px-5 py-5">
      <header className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-[#8f7f6f]">
          {title}
        </h2>
      </header>
      <div className="divide-y divide-[#f0e3d4] rounded-lg">{children}</div>
    </section>
  );
}
