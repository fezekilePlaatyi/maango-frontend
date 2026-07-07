import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { fetchMatchingRequests, fetchMyPro, useAppDispatch, useAppSelector } from "@/app/store";
import { canRespondToDeals, currency } from "@/lib/permissions";
import { SubscriptionBanner, LockedRequestCard } from "@/components/feedback/Subscription";
import { RequestCard } from "@/components/cards/RequestCard";
import { EmptyState } from "@/components/feedback/EmptyState";

export const Route = createFileRoute("/app/pro/matching")({ component: Matching });

function Matching() {
  const user = useAppSelector(s => s.auth.user);
  const pro = useAppSelector(s => s.pro.profile);
  const matching = useAppSelector(s => s.requests.matching);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!user) return;
    dispatch(fetchMyPro(user.id));
    dispatch(fetchMatchingRequests(user.id));
  }, [user, dispatch]);

  if (!pro) return null;
  const unlocked = canRespondToDeals(pro);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Matching leads</h1>
        <p className="mt-1 text-sm text-muted-foreground">Requests in your category and service areas.</p>
      </div>
      <SubscriptionBanner pro={pro} />
      {matching.length === 0 ? (
        <EmptyState icon="🌱" title="No matching leads yet" body="Check back soon — we'll notify you as soon as one pops up." />
      ) : (
        <div className="grid gap-3">
          {matching.map(r => unlocked
            ? <RequestCard key={r.id} req={r} href={`/app/pro/matching/${r.id}`} />
            : <LockedRequestCard key={r.id} req={r} />)}
        </div>
      )}
    </div>
  );
}
