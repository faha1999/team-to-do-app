"use client";

import { useState } from "react";

export function QuickAdd({ onCreate }: { onCreate?: (title: string) => void }) {
  const [title, setTitle] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    onCreate?.(title.trim());
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        placeholder="Add a task..."
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Add
      </button>
    </form>
  );
}
