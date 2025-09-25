// src/app/(dashboard)/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Dashboard · Team To-Do',
  description: 'Plan, prioritize, and ship with focus.',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-100 text-zinc-900 antialiased">
        {/* Soft background accent */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div
            className="absolute inset-x-0 top-[-10rem] mx-auto h-[24rem] w-[36rem] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(60% 60% at 50% 40%, rgba(24,24,27,0.10), rgba(24,24,27,0))',
            }}
          />
        </div>

        <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-6 py-6">
          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
              <div className="border-b border-zinc-200 bg-zinc-50/60 px-4 py-3">
                <p className="text-sm font-semibold text-zinc-900">Workspace</p>
              </div>
              <nav className="p-2">
                <NavLink href="/(dashboard)">Today</NavLink>
                <NavLink href="/(dashboard)/upcoming">Upcoming</NavLink>
                <NavLink href="/(dashboard)/inbox">Inbox</NavLink>
                <div className="my-2 h-px bg-zinc-100" />
                <NavLink href="/(dashboard)/projects">Projects</NavLink>
                <NavLink href="/(dashboard)/labels">Labels</NavLink>
                <NavLink href="/(dashboard)/filters">Filters</NavLink>
                <div className="my-2 h-px bg-zinc-100" />
                <NavLink href="/(dashboard)/calendar/week">
                  Calendar — Week
                </NavLink>
                <NavLink href="/(dashboard)/calendar/month">
                  Calendar — Month
                </NavLink>
                <div className="my-2 h-px bg-zinc-100" />
                <NavLink href="/(dashboard)/teams">Teams</NavLink>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <section className="flex-1">
            {/* Topbar */}
            <header className="sticky top-6 z-10 mb-6">
              <div className="rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-block h-2 w-2 rounded-full bg-zinc-900" />
                    <p className="text-sm font-medium text-zinc-900">
                      Team To-Do
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="/settings"
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium hover:bg-zinc-50">
                      Settings
                    </a>
                    <a
                      href="/api/auth/signout"
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium hover:bg-zinc-50">
                      Sign out
                    </a>
                  </div>
                </div>
              </div>
            </header>

            {children}
          </section>
        </div>
      </body>
    </html>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  // Non-active styling (server component) — keep simple and elegant
  return (
    <Link
      href={href}
      className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900">
      {children}
    </Link>
  );
}
