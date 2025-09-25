import Link from "next/link";
import { Suspense } from "react";

import { LogoutButton } from "@/components/layout/logout-button";
import { UserBadge } from "@/components/layout/user-badge";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-black/10 bg-white/70 px-8 py-5 backdrop-blur">
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">Command palette</span>
        <kbd className="rounded-lg border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 shadow-sm">
          ⌘K
        </kbd>
      </div>
      <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
        <Link href="/app/notifications" className="transition hover:text-slate-900">
          Notifications
        </Link>
        <Suspense fallback={<div className="h-8 w-24 rounded-full bg-slate-200" />}>
          <UserBadge />
        </Suspense>
        <LogoutButton />
      </div>
    </header>
  );
}
