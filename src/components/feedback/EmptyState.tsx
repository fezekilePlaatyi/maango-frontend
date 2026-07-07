import type { ReactNode } from "react";

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-warm/40 px-6 py-12 text-center">
      {icon && <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-mango-soft text-2xl">{icon}</div>}
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
