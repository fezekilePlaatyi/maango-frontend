import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Check } from "lucide-react";
import { fetchDealsForRequest, hireProForRequest, useAppDispatch, useAppSelector } from "@/app/store";
import { requestsApi, prosApi } from "@/api/realApi";
import type { ServiceRequest, ProProfile } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { currency } from "@/lib/permissions";

export const Route = createFileRoute("/app/client/requests/$id")({ component: RequestDetail });

function RequestDetail() {
  const { id } = Route.useParams();
  const dispatch = useAppDispatch();
  const deals = useAppSelector(s => s.deals.byRequest[id] ?? []);
  const [req, setReq] = useState<ServiceRequest | null>(null);
  const [pros, setPros] = useState<Record<string, ProProfile>>({});

  useEffect(() => {
    requestsApi.getById(id).then(setReq);
    dispatch(fetchDealsForRequest(id));
  }, [id, dispatch]);

  useEffect(() => {
    Promise.all(deals.map(d => prosApi.getById(d.proId).catch(() => null))).then(list => {
      const map: Record<string, ProProfile> = {};
      list.forEach(p => { if (p) map[p.userId] = p; });
      setPros(map);
    });
  }, [deals]);

  async function hire(proId: string) {
    await dispatch(hireProForRequest({ requestId: id, proId })).unwrap();
    toast.success("Pro hired — contact details unlocked");
    const updated = await requestsApi.getById(id);
    setReq(updated);
    dispatch(fetchDealsForRequest(id));
  }

  if (!req) return <div>Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/app/client/requests" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-3.5 w-3.5" />Back</Link>
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">{req.category}</Badge>
          <Badge variant="outline" className="capitalize">{req.status.replace("_", " ")}</Badge>
        </div>
        <h1 className="mt-2 font-display text-2xl font-semibold">{req.title}</h1>
        <p className="mt-2 text-muted-foreground">{req.description}</p>
        <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
          <span>📍 {req.city}</span>
          {req.budget && <span>Budget: {currency(req.budget)}</span>}
          <span>Posted {new Date(req.createdAt).toLocaleDateString()}</span>
        </div>
      </Card>

      <h2 className="mt-8 font-display text-xl font-semibold">Responses ({deals.length})</h2>
      <div className="mt-3 space-y-3">
        {deals.length === 0 ? (
          <EmptyState icon="⏳" title="Waiting for pros to respond" body="Verified pros in your area have been notified." />
        ) : deals.map(d => {
          const pro = pros[d.proId];
          const isHired = req.hiredProId === d.proId;
          const isRejected = req.status === "hired" && !isHired;
          return (
            <Card key={d.id} className={`p-5 ${isHired ? "border-leaf bg-leaf-soft/30" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-mango font-display font-semibold text-mango-foreground">{pro?.businessName.charAt(0) ?? "?"}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link to="/pros/$proId" params={{ proId: d.proId }} className="font-semibold hover:underline">{pro?.businessName ?? "Provider"}</Link>
                      {isHired && <Badge className="border-0 bg-leaf text-leaf-foreground">Hired</Badge>}
                      {isRejected && <Badge variant="outline">Not selected</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">⭐ {pro?.rating ?? "-"} · {pro?.reviewCount ?? 0} reviews · Replies in ~{pro?.responseTimeHours ?? "-"}h</div>
                    <p className="mt-2 text-sm">{d.message}</p>
                    <div className="mt-2 text-sm">Quote: <span className="font-semibold">{currency(d.quote)}</span> · ETA: {d.etaDays} day{d.etaDays === 1 ? "" : "s"}</div>
                    {isHired && pro && <div className="mt-3 rounded-lg bg-warm p-3 text-sm">📞 {(pro as any).phone ?? "+27 82 555 0202"} — contact your hired pro directly.</div>}
                  </div>
                </div>
                {req.status === "open" && (
                  <Button variant="mango" size="sm" onClick={() => hire(d.proId)}><Check className="h-4 w-4" />Hire</Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
