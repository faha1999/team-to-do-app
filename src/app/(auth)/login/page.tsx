// src/app/(auth)/login/page.tsx
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      {/* Background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-x-0 top-[-10rem] mx-auto h-[24rem] w-[36rem] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 40%, rgba(24,24,27,0.12), rgba(24,24,27,0))',
          }}
        />
      </div>

      <section className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-zinc-950" />
            <div className="text-center">
              <h1 className="text-lg font-semibold tracking-tight text-zinc-950">
                Your Company
              </h1>
              <p className="text-sm text-zinc-500">Secure sign in</p>
            </div>
          </div>

          {/* Card */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
            <div className="border-b border-zinc-200 bg-zinc-50/50 px-6 py-4">
              <h2 className="text-base font-medium text-zinc-900">
                Welcome back
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Sign in to manage your tasks and projects.
              </p>
            </div>

            <form
              className="px-6 py-6"
              method="post"
              action="/api/auth/login"
              noValidate>
              <div className="grid gap-5">
                {/* Email */}
                <div className="grid gap-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-zinc-800">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-zinc-800">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900">
                      Forgot?
                    </Link>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>

                {/* Remember me */}
                <div className="flex items-center justify-between">
                  <label className="inline-flex select-none items-center gap-3">
                    <input
                      type="checkbox"
                      name="remember"
                      className="peer h-4 w-4 cursor-pointer rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                    <span className="text-sm text-zinc-600 peer-checked:text-zinc-800">
                      Remember me
                    </span>
                  </label>

                  {/* Optional: subtle device notice */}
                  <span className="text-xs text-zinc-400">
                    Private device recommended
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition active:scale-[0.99] hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20">
                  Sign in
                </button>
              </div>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-zinc-200" />
                <span className="text-xs uppercase tracking-wider text-zinc-400">
                  or
                </span>
                <div className="h-px flex-1 bg-zinc-200" />
              </div>

              {/* Social (placeholders; wire to your providers later) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20">
                  <span className="inline-block h-4 w-4 rounded-[4px] bg-zinc-900" />
                  Google
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20">
                  <span className="inline-block h-4 w-4 rounded-full bg-zinc-900" />
                  GitHub
                </button>
              </div>

              {/* Helper text */}
              <p className="mt-6 text-center text-sm text-zinc-600">
                Don’t have an account?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-zinc-900 underline underline-offset-4 hover:opacity-90">
                  Create one
                </Link>
              </p>
            </form>
          </div>

          {/* Footer microcopy */}
          <p className="mt-6 text-center text-xs text-zinc-500">
            Protected by best practices. Never share your password.
          </p>
        </div>
      </section>
    </main>
  );
}
