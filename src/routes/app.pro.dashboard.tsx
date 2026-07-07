import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { CheckCircle2, TrendingUp } from "lucide-react";
import { fetchMatchingRequests, fetchMyDeals, fetchMyPro, useAppDispatch, useAppSelector } from "@/app/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubscriptionBanner } from "@/components/feedback/Subscription";

export const Route = createFileRoute("/app/pro/dashboard")({ component: ProDash });

function ProDash() {
  const user = useAppSelector(s => s.auth.user);
  const pro = useAppSelector(s => s.pro.profile);
  const matching = useAppSelector(s => s.requests.matching);
  const deals = useAppSelector(s => s.deals.mine);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!user) return;
    dispatch(fetchMyPro(user.id));
    dispatch(fetchMatchingRequests(user.id));
    dispatch(fetchMyDeals(user.id));
  }, [user, dispatch]);

  if (!pro) return <div>Loading…</div>;

  if (pro.status === "draft") {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mango-soft text-3xl">🧰</div>
        <h1 className="mt-4 font-display text-2xl font-semibold">Complete your business profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tell us about your services so we can start matching you to local leads.</p>
        <Button variant="mango" className="mt-6" asChild><Link to="/app/pro/onboarding">Start onboarding</Link></Button>
      </Card>
    );
  }
  if (pro.status === "pending") {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold/20 text-3xl">⏳</div>
        <h1 className="mt-4 font-display text-2xl font-semibold">Application under review</h1>
        <p className="mt-2 text-sm text-muted-foreground">Our team is verifying your details. This usually takes 1 business day.</p>
      </Card>
    );
  }
  if (pro.status === "denied") {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center border-destructive/40">
        <h1 className="font-display text-2xl font-semibold text-destructive">Application not approved</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please contact support for details on next steps.</p>
        <Button variant="warm" className="mt-6" asChild><Link to="/app/support">Contact support</Link></Button>
      </Card>
    );
  }

  const acceptedCount = deals.filter(d => d.status === "accepted").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">{pro.businessName}</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          {pro.verified && <span className="inline-flex items-center gap-1 text-leaf"><CheckCircle2 className="h-4 w-4" />Verified</span>}
          <span>·</span><span>{matching.length} matching leads today</span>
        </div>
      </div>

      <SubscriptionBanner pro={pro} />

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Matching leads", value: matching.length },
          { label: "Responses sent", value: deals.length },
          { label: "Accepted", value: acceptedCount },
          { label: "Rating", value: pro.rating.toFixed(1) },
        ].map(s => (
          <Card key={s.label} className="p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-1 font-display text-3xl font-semibold">{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Latest matching leads</h3>
            <Button size="sm" variant="ghost" asChild><Link to="/app/pro/matching">See all</Link></Button>
          </div>
          <div className="space-y-2">
            {matching.slice(0, 3).map(r => (
              <div key={r.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between"><div className="font-medium">{r.title}</div><Badge variant="outline">{r.city}</Badge></div>
                <div className="text-xs text-muted-foreground">{r.description.slice(0, 80)}…</div>
              </div>
            ))}
            {matching.length === 0 && <div className="text-sm text-muted-foreground">No new leads yet — check back soon.</div>}
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-mango" />
            <h3 className="font-display text-lg font-semibold">Grow with a bigger plan</h3>
          </div>
          <p className="text-sm text-muted-foreground">Unlock unlimited leads and top-of-search placement.</p>
          <Button variant="mango" className="mt-4" asChild><Link to="/app/pro/billing">View plans</Link></Button>
        </Card>
      </div>
    </div>
  );
}
