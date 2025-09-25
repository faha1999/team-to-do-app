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
    <div className="space-y-3 rounded-lg border border-dashed border-indigo-300 p-4">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-800">Filter Builder</h3>
        <button
          onClick={addCondition}
          className="text-sm font-medium text-indigo-600 hover:underline"
          type="button"
        >
          Add condition
        </button>
      </header>
      {conditions.length === 0 ? (
        <p className="text-sm text-slate-500">No conditions yet.</p>
      ) : (
        <ul className="space-y-2 text-sm text-slate-700">
          {conditions.map((condition, index) => (
            <li key={`${condition.field}-${index}`}>
              {condition.field} {condition.operator} {condition.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
