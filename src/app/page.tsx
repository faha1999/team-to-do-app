import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="flex items-center justify-between px-6 py-5">
        <p className="text-lg font-semibold">Team To-Do</p>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/" 
            className="rounded-full border border-slate-700 px-3 py-1.5 hover:border-white"
          >
            Product
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-slate-700 px-3 py-1.5 hover:border-white"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-white px-4 py-1.5 text-slate-900 hover:bg-slate-100"
          >
            Sign in
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <span className="rounded-full border border-slate-700 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
          Coordinate work effortlessly
        </span>
        <h1 className="max-w-2xl text-balance text-4xl font-semibold sm:text-5xl">
          Bring personal tasks and team projects together in one focused workspace.
        </h1>
        <p className="max-w-xl text-pretty text-base text-slate-300 sm:text-lg">
          Capture ideas instantly, plan your day with confidence, and keep your entire
          team aligned with boards, calendars, reminders, and audit-ready activity.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
          >
            Sign in
          </Link>
        </div>
      </main>
      <footer className="px-6 py-4 text-center text-xs text-slate-500">
        Built with Next.js, TypeScript, Tailwind CSS, and Prisma.
      </footer>
    </div>
  );
}
