import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { fetchMyDeals, useAppDispatch, useAppSelector } from "@/app/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { currency } from "@/lib/permissions";

export const Route = createFileRoute("/app/pro/responses")({ component: Responses });

function Responses() {
  const user = useAppSelector(s => s.auth.user);
  const deals = useAppSelector(s => s.deals.mine);
  const dispatch = useAppDispatch();
  useEffect(() => { if (user) dispatch(fetchMyDeals(user.id)); }, [user, dispatch]);

  const tone: Record<string, string> = { pending: "outline", accepted: "default", rejected: "outline", withdrawn: "outline" };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">My responses</h1>
      <p className="mt-1 text-sm text-muted-foreground">Track the quotes you've sent.</p>
      <div className="mt-6 space-y-3">
        {deals.length === 0 ? (
          <EmptyState icon="📨" title="No responses yet" body="Respond to a matching lead to see it here." />
        ) : deals.map(d => (
          <Card key={d.id} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={d.status === "accepted" ? "default" : "outline"} className={d.status === "accepted" ? "bg-leaf text-leaf-foreground" : ""}>{d.status}</Badge>
                  <span className="text-sm text-muted-foreground">Sent {new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-sm">{d.message}</p>
              </div>
              <div className="text-right">
                <div className="font-display text-lg font-semibold">{currency(d.quote)}</div>
                <div className="text-xs text-muted-foreground">ETA {d.etaDays}d</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
