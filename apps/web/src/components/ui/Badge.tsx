import type { ReactNode } from "react";
import clsx from "clsx";

export type Tone = "slate" | "blue" | "green" | "amber" | "red" | "purple";

const toneClasses: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

export function Badge({ tone = "slate", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium", toneClasses[tone])}>
      {children}
    </span>
  );
}
