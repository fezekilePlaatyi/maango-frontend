import { Link } from "@tanstack/react-router";
import { MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/permissions";
import type { ServiceRequest } from "@/types";

export function RequestCard({ req, href }: { req: ServiceRequest; href: string }) {
  return (
    <Link to={href}>
      <Card className="p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">{req.category}</Badge>
              {req.urgency === "asap" && <Badge className="border-0 bg-mango text-mango-foreground">Urgent</Badge>}
              <Badge variant="outline" className="capitalize">{req.status.replace("_", " ")}</Badge>
            </div>
            <h3 className="mt-2 truncate font-display text-lg font-semibold">{req.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{req.description}</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{req.city}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(req.createdAt).toLocaleDateString()}</span>
              {req.budget && <span>Budget: {currency(req.budget)}</span>}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
