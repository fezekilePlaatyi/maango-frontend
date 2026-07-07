import { Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin, Star, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProProfile } from "@/types";

export function ProviderCard({ pro }: { pro: ProProfile }) {
  const businessName = pro.businessName || "Service provider";
  const rating = Number.isFinite(Number(pro.rating)) ? Number(pro.rating) : 0;
  const reviewCount = Number.isFinite(Number(pro.reviewCount)) ? Number(pro.reviewCount) : 0;
  const responseTimeHours = Number.isFinite(Number(pro.responseTimeHours)) ? Number(pro.responseTimeHours) : 24;
  const services = Array.isArray(pro.services) ? pro.services : [];
  const serviceAreas = Array.isArray(pro.serviceAreas) ? pro.serviceAreas : [];

  return (
    <Link to="/pros/$proId" params={{ proId: pro.userId }}>
      <Card className="group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-warm">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-mango font-display text-xl font-semibold text-mango-foreground">
            {businessName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-display text-lg font-semibold">{businessName}</h3>
              {pro.verified && <Badge className="bg-leaf-soft text-leaf border-0"><CheckCircle2 className="mr-1 h-3 w-3" />Verified</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{pro.bio || "Ready to help with local home service requests."}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-gold text-gold" />{rating.toFixed(1)} ({reviewCount})</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{serviceAreas[0] ?? "Service area pending"}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Replies in ~{responseTimeHours}h</span>
            </div>
            {services.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {services.slice(0, 3).map(s => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-xs">{s}</span>)}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
