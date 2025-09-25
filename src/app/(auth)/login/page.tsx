import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-[#f4f5f8] to-[#dfe2e7] px-6 py-16">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-black/5 bg-white/80 p-10 shadow-2xl shadow-black/10 backdrop-blur">
        <header className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Welcome back
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">Sign in to Team To-Do</h1>
          <p className="text-sm text-slate-600">
            Access projects, tasks, and the full command palette experience.
          </p>
        </header>
        <LoginForm />
      </div>
    </main>
  );
}
