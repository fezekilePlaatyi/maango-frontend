import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supportApi } from "@/api/realApi";
import type { SupportTicket } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/EmptyState";

export const Route = createFileRoute("/app/admin/support")({ component: AdminSupport });

function AdminSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  useEffect(() => { supportApi.listAll().then(setTickets); }, []);
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Support tickets</h1>
      <div className="mt-6 space-y-3">
        {tickets.length === 0
          ? <EmptyState icon="💬" title="No tickets yet" body="User-submitted support tickets will appear here." />
          : tickets.map(t => (
            <Card key={t.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{t.subject}</div>
                <Badge variant="outline" className="capitalize">{t.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{t.message}</p>
              <div className="mt-1 text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</div>
            </Card>
          ))}
      </div>
    </div>
  );
}
