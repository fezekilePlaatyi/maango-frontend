import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { prosApi } from "@/api/realApi";
import type { ProProfile } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/EmptyState";

export const Route = createFileRoute("/app/admin/applications")({ component: Applications });

function Applications() {
  const [pros, setPros] = useState<ProProfile[]>([]);
  const load = () => prosApi.listAll().then(setPros);
  useEffect(() => { load(); }, []);
  async function decide(id: string, status: "approved" | "denied") {
    await prosApi.setStatus(id, status);
    toast.success(`Application ${status}`);
    load();
  }
  const providers = pros.filter(p => p.businessName && p.userId);
  const pending = providers.filter(p => p.status === "pending" && !p.verified);

  function statusBadge(pro: ProProfile) {
    if (pro.verified || pro.status === "approved") return <Badge className="border-0 bg-leaf text-leaf-foreground">Verified</Badge>;
    if (pro.status === "pending") return <Badge className="bg-gold/15 text-charcoal border-gold/30">Needs review</Badge>;
    return <Badge variant="outline" className="capitalize">{pro.status}</Badge>;
  }

  function subscriptionBadge(pro: ProProfile) {
    const status = pro.subscription?.status ?? "none";
    return <Badge variant="outline" className="capitalize">Plan: {status}</Badge>;
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Provider applications</h1>
      <div className="mt-6 space-y-3">
        {pending.length === 0
          ? <EmptyState icon="✅" title="No pending applications" />
          : pending.map(p => (
            <Card key={p.userId} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2"><h3 className="font-display text-lg font-semibold">{p.businessName}</h3><Badge variant="outline" className="capitalize">{p.category}</Badge></div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.bio}</p>
                  <div className="mt-2 text-xs text-muted-foreground">Services: {p.services.join(", ") || "—"} · Areas: {p.serviceAreas.join(", ") || "—"} · {p.yearsExperience}y</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="warm" onClick={() => decide(p.userId, "denied")}>Deny</Button>
                  <Button size="sm" variant="leaf" onClick={() => decide(p.userId, "approved")}>Approve</Button>
                </div>
              </div>
            </Card>
          ))}
      </div>
      <h2 className="mt-10 font-display text-xl font-semibold">All providers</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {providers.map(p => (
          <Card key={p.userId} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{p.businessName}</div>
                <div className="text-xs text-muted-foreground capitalize">{p.category || "uncategorised"}</div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {statusBadge(p)}
                {subscriptionBadge(p)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
