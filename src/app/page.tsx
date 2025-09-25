import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-[#f4f5f8] to-[#dfe2e7]" />
      <header className="flex items-center justify-between px-10 py-8">
        <span className="text-lg font-semibold text-slate-900">Team To-Do</span>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link href="/app" className="rounded-full px-4 py-2 transition hover:bg-black hover:text-white">
            Launch app
          </Link>
          <Link href="/login" className="rounded-full px-4 py-2 transition hover:bg-black hover:text-white">
            Sign in
          </Link>
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 px-6 pb-24 text-center">
        <span className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500 shadow-sm">
          Designed for modern teams
        </span>
        <h1 className="max-w-3xl text-balance text-5xl font-semibold text-slate-900 drop-shadow-sm">
          Strategy, execution, and daily momentum in a single premium workspace.
        </h1>
        <p className="max-w-2xl text-pretty text-lg leading-relaxed text-slate-600">
          Build alignment with shared projects, plan your day with adaptive views, and maintain clarity with rich context—without sacrificing speed or polish.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-full bg-black px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
          >
            Create free workspace
          </Link>
          <Link
            href="/app"
            className="rounded-full border border-black/10 bg-white/80 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-sm transition hover:border-black/40"
          >
            Explore dashboard
          </Link>
        </div>
      </main>
      <footer className="px-10 pb-10 text-xs text-slate-500">
        Crafted with Next.js, TypeScript, Tailwind CSS, and Prisma.
      </footer>
    </div>
  );
}
