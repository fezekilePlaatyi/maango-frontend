import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { fetchMyRequests, useAppDispatch, useAppSelector } from "@/app/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequestCard } from "@/components/cards/RequestCard";
import { EmptyState } from "@/components/feedback/EmptyState";

export const Route = createFileRoute("/app/client/dashboard")({ component: ClientDash });

function ClientDash() {
  const user = useAppSelector(s => s.auth.user);
  const requests = useAppSelector(s => s.requests.mine);
  const dispatch = useAppDispatch();
  useEffect(() => { if (user) dispatch(fetchMyRequests(user.id)); }, [user, dispatch]);

  const open = requests.filter(r => r.status === "open").length;
  const hired = requests.filter(r => r.status === "hired").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Hi {user?.name.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-muted-foreground">Your home projects, all in one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active requests", value: open, tint: "bg-mango-soft" },
          { label: "Hired pros", value: hired, tint: "bg-leaf-soft" },
          { label: "Total requests", value: requests.length, tint: "bg-secondary" },
        ].map(s => (
          <Card key={s.label} className="p-5">
            <div className={`mb-2 inline-flex rounded-full ${s.tint} px-2 py-0.5 text-xs`}>{s.label}</div>
            <div className="font-display text-4xl font-semibold">{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="mango" asChild><Link to="/app/client/requests/new"><Plus className="h-4 w-4" />Post a request</Link></Button>
        <Button variant="warm" asChild><Link to="/search"><Search className="h-4 w-4" />Browse pros</Link></Button>
      </div>

      <div>
        <h2 className="mb-3 font-display text-xl font-semibold">Recent requests</h2>
        {requests.length === 0 ? (
          <EmptyState icon="🥭" title="No requests yet" body="Start by posting your first project." action={<Button variant="mango" asChild><Link to="/app/client/requests/new">Post a request</Link></Button>} />
        ) : (
          <div className="grid gap-3">
            {requests.slice(0, 5).map(r => <RequestCard key={r.id} req={r} href={`/app/client/requests/${r.id}`} />)}
          </div>
        )}
      </div>
    </div>
  );
}
