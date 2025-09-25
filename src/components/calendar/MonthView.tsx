import type { ReactNode } from "react";

export function MonthView({ children }: { children?: ReactNode }) {
  return (
    <div className="grid grid-cols-7 gap border border-slate-200 bg-white">
      {children ?? (
        <p className="col-span-7 p-6 text-center text-sm text-slate-500">
          Month view renders tasks distributed across calendar days.
        </p>
      )}
    </div>
  );
}
