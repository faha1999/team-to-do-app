"use client";

import { useState, useTransition } from "react";

import { createTask } from "@/server/actions/tasks";

export function QuickAdd({
  projectId,
  sectionId,
}: {
  projectId?: string;
  sectionId?: string;
}) {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Add a task title to continue");
      return;
    }

    startTransition(async () => {
      try {
        await createTask({ title: title.trim(), projectId, sectionId });
        setTitle("");
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Unable to create task");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-3">
      <input
        className="flex-1 rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-inner shadow-black/5 focus:border-slate-900 focus:outline-none"
        placeholder="Add a task..."
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <button
        type="submit"
        className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
        disabled={isPending}
      >
        {isPending ? "Adding…" : "Add"}
      </button>
      {error ? (
        <p className="self-end text-xs text-rose-600" aria-live="polite">
          {error}
        </p>
      ) : null}
    </form>
  );
}
