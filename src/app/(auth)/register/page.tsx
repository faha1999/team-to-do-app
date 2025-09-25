// src/app/(auth)/register/page.tsx
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type Strength = 0 | 1 | 2 | 3 | 4;

function scorePassword(pw: string): Strength {
  let score: number = 0;
  if (!pw) return 0;
  // length
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  // diversity
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4) as Strength;
}

function strengthLabel(s: Strength) {
  switch (s) {
    case 0:
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
  }
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);

  const pwStrength = useMemo(() => scorePassword(pw), [pw]);
  const emailOk = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );
  const nameOk = name.trim().length >= 2;
  const pwOk = pw.length >= 8;
  const matchOk = pw && pw === pw2;

  const formValid = nameOk && emailOk && pwOk && matchOk && agree;

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      {/* Subtle background accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute left-1/2 top-[-8rem] h-[28rem] w-[42rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 40%, rgba(24,24,27,0.10), rgba(24,24,27,0))',
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
              <p className="text-sm text-zinc-500">Create your account</p>
            </div>
          </div>

          {/* Card */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
            <div className="border-b border-zinc-200 bg-zinc-50/50 px-6 py-4">
              <h2 className="text-base font-medium text-zinc-900">
                Get started
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Join your team to organize tasks and projects.
              </p>
            </div>

            <form
              className="px-6 py-6"
              action="/api/auth/register"
              method="post"
              noValidate>
              <div className="grid gap-5">
                {/* Name */}
                <div className="grid gap-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-zinc-800">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  />
                  {!nameOk && name.length > 0 && (
                    <p className="text-xs text-zinc-500">
                      Enter at least 2 characters.
                    </p>
                  )}
                </div>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  />
                  {!emailOk && email.length > 0 && (
                    <p className="text-xs text-zinc-500">
                      Use a valid email address.
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-zinc-800">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPw ? 'text' : 'password'}
                      required
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 pr-12 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute inset-y-0 right-0 my-auto mr-2 inline-flex h-8 items-center justify-center rounded-lg px-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                      aria-label={showPw ? 'Hide password' : 'Show password'}>
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {/* Strength meter */}
                  <div className="mt-1 grid gap-1.5">
                    <div className="flex h-1.5 gap-1.5">
                      {Array.from({ length: 4 }).map((_, i) => {
                        const active = i < pwStrength;
                        return (
                          <span
                            key={i}
                            className={`flex-1 rounded-full ${
                              active ? 'bg-zinc-900' : 'bg-zinc-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-zinc-500">
                        Strength:{' '}
                        <span className="font-medium text-zinc-700">
                          {strengthLabel(pwStrength)}
                        </span>
                      </p>
                      {!pwOk && pw.length > 0 && (
                        <p className="text-xs text-zinc-500">
                          Min 8 characters.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="grid gap-2">
                  <label
                    htmlFor="confirm"
                    className="text-sm font-medium text-zinc-800">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    name="confirm"
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  />
                  {!matchOk && pw2.length > 0 && (
                    <p className="text-xs text-zinc-500">
                      Passwords do not match.
                    </p>
                  )}
                </div>

                {/* Terms */}
                <label className="mt-1 inline-flex select-none items-start gap-3">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 h-4 w-4 cursor-pointer rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-sm text-zinc-600">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="font-medium text-zinc-800 underline underline-offset-4 hover:text-zinc-950">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="font-medium text-zinc-800 underline underline-offset-4 hover:text-zinc-950">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!formValid}
                  className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-black active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-disabled={!formValid}>
                  Create account
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
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-zinc-900 underline underline-offset-4 hover:opacity-90">
                  Sign in
                </Link>
              </p>
            </form>
          </div>

          {/* Footer microcopy */}
          <p className="mt-6 text-center text-xs text-zinc-500">
            We respect your privacy. Passwords are encrypted on our servers.
          </p>
        </div>
      </section>
    </main>
  );
}
