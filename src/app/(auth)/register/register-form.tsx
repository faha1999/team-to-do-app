"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { registerAction, type AuthFormState } from "@/server/actions/auth";

const initialState: AuthFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
      disabled={pending}
    >
      {pending ? "Creating…" : "Create account"}
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          placeholder="Your name"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          placeholder="you@company.com"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
        />
      </div>
      {state.error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
      <p className="text-center text-xs text-slate-500">
        Already have an account? {" "}
        <Link href="/login" className="text-slate-900 underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
