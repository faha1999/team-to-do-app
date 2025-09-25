"use client";

import { useFormStatus } from "react-dom";

import { logoutAction } from "@/server/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="rounded-md border border-[#eadfd0] bg-white px-3 py-1.5 text-sm font-medium text-[#7a6757] transition hover:bg-[#f7efe6] hover:text-[#3c2f23] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <SubmitButton />
    </form>
  );
}
