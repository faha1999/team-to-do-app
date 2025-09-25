import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-[#f4f5f8] to-[#dfe2e7] px-6 py-16">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-black/5 bg-white/85 p-10 shadow-2xl shadow-black/10 backdrop-blur">
        <header className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Create workspace
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Start building momentum
          </h1>
          <p className="text-sm text-slate-600">
            We’ll spin up a personal project and get you ready for your first team invite.
          </p>
        </header>
        <RegisterForm />
      </div>
    </main>
  );
}
