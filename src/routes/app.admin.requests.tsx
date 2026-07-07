import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { requestsApi } from "@/api/realApi";
import type { ServiceRequest } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/permissions";

export const Route = createFileRoute("/app/admin/requests")({ component: AdminRequests });

function AdminRequests() {
  const [reqs, setReqs] = useState<ServiceRequest[]>([]);
  useEffect(() => { requestsApi.listAll().then(setReqs); }, []);
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">All requests</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {reqs.map(r => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center gap-2"><Badge variant="outline" className="capitalize">{r.category}</Badge><Badge variant="outline" className="capitalize">{r.status.replace("_", " ")}</Badge></div>
            <div className="mt-1 font-medium">{r.title}</div>
            <div className="text-xs text-muted-foreground">{r.city} · {r.budget ? currency(r.budget) : "no budget"} · {new Date(r.createdAt).toLocaleDateString()}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
