"use client";

import { useState } from "react";

export type TaskEditorProps = {
  defaultValue?: string;
  onSave?: (value: string) => void;
  onCancel?: () => void;
};

export function TaskEditor({ defaultValue = "", onSave, onCancel }: TaskEditorProps) {
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave?.(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        rows={4}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Save
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
