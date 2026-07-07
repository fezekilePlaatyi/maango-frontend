import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector, markNotifRead, fetchNotifications } from "@/app/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";

export const Route = createFileRoute("/app/notifications")({ component: NotifPage });

function NotifPage() {
  const user = useAppSelector(s => s.auth.user);
  const items = useAppSelector(s => s.notifications.items);
  const dispatch = useAppDispatch();
  useEffect(() => { if (user) dispatch(fetchNotifications(user.id)); }, [user, dispatch]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-semibold">Notifications</h1>
      <p className="mt-1 text-sm text-muted-foreground">Everything that's happened on your Maango account.</p>
      <div className="mt-6 space-y-3">
        {items.length === 0 ? (
          <EmptyState icon="🔔" title="You're all caught up" body="New activity will show up here." />
        ) : items.map(n => (
          <Card key={n.id} className={`p-4 ${!n.read ? "border-mango/40 bg-mango-soft/30" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{n.title}</div>
                <div className="text-sm text-muted-foreground">{n.body}</div>
                <div className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.read && <Button size="sm" variant="ghost" onClick={() => dispatch(markNotifRead(n.id))}>Mark read</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
