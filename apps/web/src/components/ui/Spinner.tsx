import clsx from "clsx";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600 dark:border-slate-700 dark:border-t-brand-400",
        className,
      )}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center py-16">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
