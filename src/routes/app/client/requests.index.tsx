import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { fetchMyRequests, useAppDispatch, useAppSelector } from "@/app/store";
import { RequestCard } from "@/components/cards/RequestCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/client/requests/")({ component: MyRequests });

function MyRequests() {
  const user = useAppSelector(s => s.auth.user);
  const requests = useAppSelector(s => s.requests.mine);
  const dispatch = useAppDispatch();
  useEffect(() => { if (user) dispatch(fetchMyRequests(user.id)); }, [user, dispatch]);
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">My requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track quotes, chat, and hire.</p>
        </div>
        <Button variant="mango" asChild><Link to="/app/client/requests/new"><Plus className="h-4 w-4" />New request</Link></Button>
      </div>
      <div className="mt-6 space-y-3">
        {requests.length === 0
          ? <EmptyState icon="📝" title="No requests" body="Post a request to receive quotes." />
          : requests.map(r => <RequestCard key={r.id} req={r} href={`/app/client/requests/${r.id}`} />)}
      </div>
    </div>
  );
}
