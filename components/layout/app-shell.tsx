"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/format";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/bets", label: "Bets" },
  { href: "/bets/new", label: "Add Bet" },
];

export function AppShell() {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/40 bg-[var(--surface)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Bet Tracker
            </h1>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === item.href
                : pathname === item.href || (item.href === "/bets" && /^\/bets\/[^/]+\/edit$/.test(pathname));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "border-teal-700 bg-teal-700 text-white"
                    : "border-[var(--border)] bg-white/70 text-slate-700 hover:border-teal-700 hover:text-teal-800",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
