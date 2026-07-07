import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { fetchMyPro, respondToRequest, useAppDispatch, useAppSelector } from "@/app/store";
import { requestsApi } from "@/api/realApi";
import type { ServiceRequest } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { canRespondToDeals, currency } from "@/lib/permissions";

export const Route = createFileRoute("/app/pro/matching/$id")({ component: RespondPage });

function RespondPage() {
  const { id } = Route.useParams();
  const user = useAppSelector(s => s.auth.user);
  const pro = useAppSelector(s => s.pro.profile);
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const [req, setReq] = useState<ServiceRequest | null>(null);
  const [message, setMessage] = useState("");
  const [quote, setQuote] = useState("");
  const [etaDays, setEtaDays] = useState("2");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) dispatch(fetchMyPro(user.id)); }, [user, dispatch]);
  useEffect(() => { requestsApi.getById(id).then(setReq); }, [id]);

  const canRespond = canRespondToDeals(pro);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !canRespond) return;
    setLoading(true);
    try {
      await dispatch(respondToRequest({ requestId: id, proId: user.id, message, quote: Number(quote), etaDays: Number(etaDays) })).unwrap();
      toast.success("Response sent — you'll be notified if the client hires you.");
      nav({ to: "/app/pro/responses" });
    } catch (err: any) { toast.error(err.message ?? "Failed"); }
    finally { setLoading(false); }
  }

  if (!req) return <div>Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/app/pro/matching" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-3.5 w-3.5" />Back to matching</Link>
      <Card className="p-6">
        <div className="flex items-center gap-2"><Badge variant="outline" className="capitalize">{req.category}</Badge>{req.urgency === "asap" && <Badge className="bg-mango text-mango-foreground border-0">Urgent</Badge>}</div>
        <h1 className="mt-2 font-display text-2xl font-semibold">{req.title}</h1>
        <p className="mt-2 text-muted-foreground">{req.description}</p>
        <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
          <span>📍 {req.city}</span>{req.budget && <span>Budget: {currency(req.budget)}</span>}<span>Posted {new Date(req.createdAt).toLocaleDateString()}</span>
        </div>
      </Card>

      {canRespond ? (
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold">Send your quote</h2>
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div><Label>Message to client</Label><Textarea rows={5} value={message} onChange={e => setMessage(e.target.value)} required placeholder="Introduce yourself, explain your approach, and any assumptions." /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Quote (ZAR)</Label><Input type="number" value={quote} onChange={e => setQuote(e.target.value)} required /></div>
              <div><Label>ETA (days)</Label><Input type="number" value={etaDays} onChange={e => setEtaDays(e.target.value)} required /></div>
            </div>
            <Button type="submit" variant="mango" disabled={loading}>{loading ? "Sending…" : "Send response"}</Button>
          </form>
        </Card>
      ) : (
        <Card className="p-6 border-mango/40 bg-mango-soft/30">
          <h2 className="font-display text-xl font-semibold">Subscribe to respond</h2>
          <p className="mt-2 text-sm text-muted-foreground">A Maango subscription unlocks quoting on this lead and every future match.</p>
          <Button variant="mango" className="mt-4" asChild><Link to="/app/pro/billing">See plans</Link></Button>
        </Card>
      )}
    </div>
  );
}
