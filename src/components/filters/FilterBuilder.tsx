"use client";

import { useState } from "react";

const operators = ["on", "before", "after", "onOrBefore", "onOrAfter"] as const;

type Operator = (typeof operators)[number];

type Condition = {
  field: string;
  operator: Operator;
  value: string;
};

export function FilterBuilder({
  onChange,
}: {
  onChange?: (conditions: Condition[]) => void;
}) {
  const [conditions, setConditions] = useState<Condition[]>([]);

  function addCondition() {
    const next = [
      ...conditions,
      { field: "status", operator: operators[0], value: "today" },
    ];
    setConditions(next);
    onChange?.(next);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-dashed border-black/10 bg-white/70 p-6 shadow-inner shadow-black/5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Design a filter</h3>
          <p className="text-sm text-slate-600">
            Combine criteria such as due dates, priority, labels, and ownership. Save it once you love the view.
          </p>
        </div>
        <button
          onClick={addCondition}
          className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-black/40"
          type="button"
        >
          Add condition
        </button>
      </header>
      {conditions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-500">
          Start by adding a condition. For example: <strong className="font-semibold text-slate-700">status on today</strong> or
          <strong className="font-semibold text-slate-700"> priority P1</strong>.
        </p>
      ) : (
        <ul className="space-y-3 text-sm text-slate-700">
          {conditions.map((condition, index) => (
            <li
              key={`${condition.field}-${index}`}
              className="flex items-center justify-between rounded-xl border border-black/5 bg-white/80 px-4 py-3 shadow-sm"
            >
              <span>
                <span className="font-semibold text-slate-900">{condition.field}</span>{" "}
                {condition.operator}{" "}
                <span className="font-semibold text-slate-900">{condition.value}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
