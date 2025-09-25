"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/app", label: "Today" },
  { href: "/app/inbox", label: "Inbox" },
  { href: "/app/upcoming", label: "Upcoming" },
  { href: "/app/calendar/week", label: "Calendar" },
  { href: "/app/projects", label: "Projects" },
  { href: "/app/teams", label: "Teams" },
  { href: "/app/filters", label: "Filters" },
  { href: "/app/labels", label: "Labels" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col gap-8 border-r border-black/10 bg-[#0f1115] px-6 py-8 text-white">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-[0.35rem] text-zinc-400">
          Team To-Do
        </p>
        <p className="text-xl font-semibold text-white">Control Hub</p>
      </div>
      <nav>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === "/app"
                ? pathname === "/app"
                : pathname?.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-white/10 text-white shadow-sm shadow-white/20"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-300">
        <p className="font-semibold text-white">Need speed?</p>
        <p className="mt-1 leading-relaxed">
          Press <span className="rounded border border-white/20 px-1 py-0.5">⌘</span>
          +<span className="rounded border border-white/20 px-1 py-0.5">K</span> to summon the command palette anywhere.
        </p>
      </div>
    </aside>
  );
}
