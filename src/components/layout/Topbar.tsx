"use client";

import Link from "next/link";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="font-medium text-slate-900">Command Palette</span>
        <kbd className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs">
          ⌘K
        </kbd>
      </div>
      <nav className="flex items-center gap-4 text-sm text-slate-600">
        <Link href="/notifications" className="hover:text-slate-900">
          Notifications
        </Link>
        <Link href="/settings" className="hover:text-slate-900">
          Settings
        </Link>
        <button
          type="button"
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Quick Add
        </button>
      </nav>
    </header>
  );
}
