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
    <div className="space-y-2">
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center gap-3 rounded-lg border border-[#eadfd0] bg-white px-4 py-3 shadow-sm shadow-[#f0e3d4]"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full border border-[#eadfd0] bg-[#fdf4ec] text-base leading-none text-[#d4522f]" aria-hidden>
          +
        </span>
        <input
          className="flex-1 border-none bg-transparent text-sm text-[#3c2f23] placeholder:text-[#b9a896] focus:outline-none"
          placeholder="Add a task"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-md bg-[#e05b37] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-[#c64c2b] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
        >
          {isPending ? "Saving" : "Add"}
        </button>
      </form>
      {error ? (
        <p className="text-xs text-[#d4522f]" aria-live="polite">
          {error}
        </p>
      ) : null}
    </div>
  );
}
