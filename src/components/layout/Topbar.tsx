import Link from "next/link";

import { LogoutButton } from "@/components/layout/logout-button";

function DisplayIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x={3.5} y={4} width={17} height={14} rx={2.5} />
      <path d="M9 20h6" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 19.5 3.5 21V6A2.5 2.5 0 0 1 6 3.5h12A2.5 2.5 0 0 1 20.5 6v9A2.5 2.5 0 0 1 18 17.5H9z" />
      <path d="M7.5 8.75h9" />
      <path d="M7.5 12h5.5" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <circle cx={6} cy={12} r={1.3} />
      <circle cx={12} cy={12} r={1.3} />
      <circle cx={18} cy={12} r={1.3} />
    </svg>
  );
}

export default function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-[#eadfd0] bg-[#fdf9f4] px-12 py-4">
      <div className="flex items-center gap-3 text-sm text-[#8f7f6f]">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#eadfd0] bg-white px-3 py-1 font-medium text-[#3c2f23]">
          <span className="rounded-full border border-[#eadfd0] bg-[#f7efe6] px-1.5 py-0.5 text-[0.65rem] leading-none text-[#a18f7c]">
            ⌘
          </span>
          K
        </span>
        <span className="text-xs uppercase tracking-[0.35em] text-[#c0ad99]">Quick find</span>
      </div>
      <div className="flex items-center gap-4 text-sm font-medium text-[#7a6757]">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-transparent px-3 py-1.5 transition hover:border-[#eadfd0] hover:bg-white hover:text-[#3c2f23]"
        >
          <DisplayIcon />
          Display
        </button>
        <Link
          href="/app/notifications"
          className="inline-flex items-center gap-2 rounded-md border border-transparent px-3 py-1.5 transition hover:border-[#eadfd0] hover:bg-white hover:text-[#3c2f23]"
        >
          <MessageIcon />
          Messages
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-transparent px-3 py-1.5 transition hover:border-[#eadfd0] hover:bg-white hover:text-[#3c2f23]"
        >
          <DotsIcon />
          More
        </button>
        <LogoutButton />
      </div>
    </header>
  );
}
