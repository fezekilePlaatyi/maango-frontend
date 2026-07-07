import { Link } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProProfile, ServiceRequest } from "@/types";
import { subscriptionBadge } from "@/lib/permissions";

type SubscriptionBannerProps = {
  pro: ProProfile;
  onContinueCheckout?: () => void;
  continuing?: boolean;
  showDefaultAction?: boolean;
};

export function SubscriptionBanner({ pro, onContinueCheckout, continuing = false, showDefaultAction = true }: SubscriptionBannerProps) {
  const b = subscriptionBadge(pro.subscription.status);
  if (pro.subscription.status === "active") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-leaf/30 bg-leaf-soft px-4 py-3 text-sm">
        <div className="flex items-center gap-2 text-leaf"><Sparkles className="h-4 w-4" /><span className="font-medium">Subscription active</span><span className="text-muted-foreground">— you can respond to all matching leads.</span></div>
        <Button variant="ghost" size="sm" asChild><Link to="/app/pro/billing">Manage billing</Link></Button>
      </div>
    );
  }
  if (pro.subscription.status === "pending") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm">
        <div><span className="font-medium text-gold-foreground">Payment pending.</span> <span className="text-muted-foreground">Complete PayFast checkout to unlock leads.</span></div>
        {onContinueCheckout ? (
          <Button variant="mango" size="sm" onClick={onContinueCheckout} disabled={continuing}>
            {continuing ? "Opening..." : "Continue checkout"}
          </Button>
        ) : (
          <Button variant="mango" size="sm" asChild><Link to="/app/pro/billing">Continue checkout</Link></Button>
        )}
      </div>
    );
  }
  if (pro.subscription.status === "past_due") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
        <div><span className="font-medium text-destructive">Payment past due.</span> <span className="text-muted-foreground">Update your billing to keep receiving leads.</span></div>
        <Button variant="destructive" size="sm" asChild><Link to="/app/pro/billing">Fix payment</Link></Button>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-mango/30 bg-mango-soft px-4 py-3 text-sm">
      <div className="flex items-center gap-2"><Badge variant="outline">{b.label}</Badge><span className="text-muted-foreground">Subscribe to unlock leads and respond to requests.</span></div>
      {showDefaultAction && <Button variant="mango" size="sm" asChild><Link to="/app/pro/billing">See plans</Link></Button>}
    </div>
  );
}

export function LockedRequestCard({ req }: { req: ServiceRequest }) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-mango-soft/40 to-transparent" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">{req.category}</Badge>
          <Badge variant="outline"><Lock className="mr-1 h-3 w-3" />Locked</Badge>
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold">{req.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{req.description.slice(0, 60)}…</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{req.city} · {new Date(req.createdAt).toLocaleDateString()}</div>
          <Button asChild size="sm" variant="mango">
            <Link to="/app/pro/billing">Subscribe to unlock</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
