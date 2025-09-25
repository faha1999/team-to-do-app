"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, type JSX } from "react";

import type { SessionUser } from "@/lib/auth";

const linkBaseClasses =
  "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition";

const NavIcons = {
  inbox: function InboxIcon() {
    return (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4.75 9.5 6 4.75h12l1.25 4.75" />
        <path d="M4 9.5v7.75a2.75 2.75 0 0 0 2.75 2.75h10.5A2.75 2.75 0 0 0 20 17.25V9.5" />
        <path d="M4 13.5h3.88c.27 1.36 1.46 2.4 2.87 2.4s2.6-1.04 2.87-2.4H16" />
      </svg>
    );
  },
  today: function TodayIcon() {
    return (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x={4} y={4.5} width={16} height={15} rx={2.5} />
        <path d="M8 3v3" />
        <path d="M16 3v3" />
        <path d="M8 12h6" />
      </svg>
    );
  },
  upcoming: function UpcomingIcon() {
    return (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4.5 8a3.5 3.5 0 0 1 3.5-3.5h8a3.5 3.5 0 0 1 3.5 3.5v8a3.5 3.5 0 0 1-3.5 3.5h-8A3.5 3.5 0 0 1 4.5 16V8Z" />
        <path d="M12 7.5v5.25l3.25 1.75" />
      </svg>
    );
  },
  filters: function FilterIcon() {
    return (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 5h16" />
        <path d="M6.5 12H17.5" />
        <path d="M9 19h6" />
      </svg>
    );
  },
  more: function MoreIcon() {
    return (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      >
        <path d="M6 12h.01" />
        <path d="M12 12h.01" />
        <path d="M18 12h.01" />
      </svg>
    );
  },
} satisfies Record<string, () => JSX.Element>;

type SidebarProps = {
  user?: SessionUser;
  counts?: {
    inbox: number;
    today: number;
    upcoming: number;
  };
  projects?: { id: string; name: string }[];
};

type NavItem = {
  href: string;
  label: string;
  icon: () => JSX.Element;
  accent: string;
  key?: keyof NonNullable<SidebarProps["counts"]>;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/app/inbox", label: "Inbox", icon: NavIcons.inbox, key: "inbox", accent: "text-[#d4522f]" },
  { href: "/app", label: "Today", icon: NavIcons.today, key: "today", accent: "text-[#dc6927]" },
  { href: "/app/upcoming", label: "Upcoming", icon: NavIcons.upcoming, key: "upcoming", accent: "text-[#b85d2a]" },
  { href: "/app/filters", label: "Filters & Labels", icon: NavIcons.filters, accent: "text-[#8e7763]" },
  { href: "/app/settings", label: "More", icon: NavIcons.more, accent: "text-[#8e7763]" },
];

export default function Sidebar({ user, counts, projects = [] }: SidebarProps) {
  const pathname = usePathname();

  const initials = useMemo(() => {
    if (!user) return "?";
    if (user.name && user.name.trim().length > 0) {
      return user.name
        .trim()
        .split(/\s+/)
        .map((segment) => segment[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return user.email.slice(0, 2).toUpperCase();
  }, [user]);

  return (
    <aside className="flex w-72 min-w-[18rem] flex-col gap-6 border-r border-[#eadfd0] bg-[#f7efe6] px-7 py-8">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e05b37] text-sm font-semibold text-white">
          {initials}
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-[#3c2f23]">
            {user?.name ?? "Your workspace"}
          </span>
          <span className="text-xs text-[#a18f7c]">
            {user?.email ?? "Stay on top of every task"}
          </span>
        </div>
      </div>

      <Link
        href="/app#quick-add"
        className="inline-flex items-center gap-2 self-start rounded-full bg-[#e05b37] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c64c2b]"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-base leading-none">+</span>
        Add task
      </Link>

      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/app"
              ? pathname === "/app"
              : pathname?.startsWith(item.href);
          const badgeValue = item.key && counts ? counts[item.key] ?? 0 : 0;
          const showBadge = badgeValue > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${linkBaseClasses} ${
                isActive
                  ? "bg-white text-[#3c2f23] shadow-sm shadow-[#e5d9cb]"
                  : "text-[#7a6757] hover:bg-white/70 hover:text-[#3c2f23]"
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-md bg-white/60 ${item.accent}`}
                >
                  <Icon />
                </span>
                {item.label}
              </span>
              {showBadge ? (
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-[#b85d2a]">
                  {badgeValue}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b39f8a]">
          My Projects
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[#6d5a4c]">
          {projects.length > 0 ? (
            projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/app/projects/${project.id}`}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 transition hover:bg-white/70 hover:text-[#3c2f23] ${
                    pathname?.startsWith(`/app/projects/${project.id}`)
                      ? "bg-white text-[#3c2f23] shadow-sm shadow-[#e5d9cb]"
                      : ""
                  }`}
                >
                  <span className="text-base text-[#d4522f]">#</span>
                  <span className="truncate">{project.name}</span>
                </Link>
              </li>
            ))
          ) : (
            <li className="rounded-md border border-dashed border-[#e1d5c5] bg-white/60 px-3 py-3 text-xs text-[#a18f7c]">
              Create a project to keep initiatives grouped and share progress with teammates.
            </li>
          )}
        </ul>
      </div>

      <div className="mt-auto text-xs text-[#a18f7c]">
        <Link href="/app/settings" className="transition hover:text-[#3c2f23]">
          Help & resources
        </Link>
      </div>
    </aside>
  );
}
