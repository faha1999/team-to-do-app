import { getCurrentUser } from "@/lib/auth";

export async function UserBadge() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const initials = user.name
    ?.split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || user.email.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
        {initials}
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-slate-900">{user.name ?? "Teammate"}</span>
        <span className="text-xs text-slate-500">{user.email}</span>
      </div>
    </div>
  );
}
