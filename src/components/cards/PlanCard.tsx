import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { currency } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types";

export function PlanCard({ plan, current, onSelect, loading }: {
  plan: Plan; current?: boolean; onSelect?: () => void; loading?: boolean;
}) {
  return (
    <Card className={cn("relative flex flex-col p-6", plan.highlighted && "border-mango shadow-warm")}>
      {plan.highlighted && <div className="absolute -top-3 left-6 rounded-full bg-gradient-mango px-3 py-0.5 text-xs font-semibold text-mango-foreground">Most popular</div>}
      <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-display text-4xl font-semibold">{currency(plan.priceMonthly)}</span>
        <span className="text-sm text-muted-foreground">/month</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {plan.leadsPerMonth === "unlimited" ? "Unlimited leads" : `${plan.leadsPerMonth} lead unlocks`}
      </p>
      <ul className="mt-4 flex-1 space-y-2 text-sm">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 text-leaf" />{f}
          </li>
        ))}
      </ul>
      <Button className="mt-6" variant={plan.highlighted ? "mango" : "warm"} disabled={current || loading} onClick={onSelect}>
        {current ? "Current plan" : loading ? "Processing..." : "Activate plan"}
      </Button>
    </Card>
  );
}
