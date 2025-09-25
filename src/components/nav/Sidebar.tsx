"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/inbox", label: "Inbox" },
  { href: "/", label: "Today" },
  { href: "/upcoming", label: "Upcoming" },
  { href: "/calendar/week", label: "Calendar" },
  { href: "/projects", label: "Projects" },
  { href: "/teams", label: "Teams" },
  { href: "/filters", label: "Filters" },
  { href: "/labels", label: "Labels" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-col gap-6 border-r border-slate-200 bg-white p-4">
      <div>
        <p className="text-lg font-semibold text-slate-900">Team To-Do</p>
        <p className="text-sm text-slate-500">Stay on top of work</p>
      </div>
      <nav>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === item.href
                : pathname?.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    "block rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900" +
                    (isActive ? " bg-slate-100 text-slate-900" : "")
                  }
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
