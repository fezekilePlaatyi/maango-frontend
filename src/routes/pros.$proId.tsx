import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, MapPin, Star, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import { PublicNav, Footer } from "@/components/layout/PublicNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReferenceGallery } from "@/components/gallery/ReferenceGallery";
import { prosApi } from "@/api/realApi";
import type { ProProfile } from "@/types";

export const Route = createFileRoute("/pros/$proId")({
  component: ProPublic,
});

function ProPublic() {
  const { proId } = Route.useParams();
  const [pro, setPro] = useState<ProProfile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { prosApi.getById(proId).then(setPro).catch(() => setPro(null)).finally(() => setLoading(false)); }, [proId]);

  if (loading) return <div className="min-h-screen bg-background"><PublicNav /><div className="mx-auto max-w-4xl p-10">Loading…</div></div>;
  if (!pro) return <div className="min-h-screen bg-background"><PublicNav /><div className="mx-auto max-w-4xl p-10">Provider not found.</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link to="/search" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-3.5 w-3.5" />Back to results</Link>
        <Card className="overflow-hidden p-0">
          <div className="h-32 bg-gradient-mango" />
          <div className="p-6">
            <div className="-mt-16 flex items-end justify-between gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-2xl border-4 border-card bg-warm font-display text-2xl font-semibold shadow-warm">{pro.businessName.charAt(0)}</div>
              <Button variant="mango" asChild><Link to="/app/client/requests/new">Request a quote</Link></Button>
            </div>
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-semibold">{pro.businessName}</h1>
                {pro.verified && <Badge className="bg-leaf-soft text-leaf border-0"><CheckCircle2 className="mr-1 h-3 w-3" />Verified</Badge>}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-gold text-gold" />{pro.rating.toFixed(1)} ({pro.reviewCount} reviews)</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{pro.serviceAreas.join(", ")}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Responds in ~{pro.responseTimeHours}h</span>
                <span>{pro.yearsExperience} yrs experience · {pro.completedJobs} jobs</span>
              </div>
              <p className="mt-4 text-muted-foreground">{pro.bio}</p>
              <div className="mt-6">
                <div className="mb-2 text-sm font-semibold">Services</div>
                <div className="flex flex-wrap gap-2">{pro.services.map(s => <span key={s} className="rounded-full bg-secondary px-3 py-1 text-xs">{s}</span>)}</div>
              </div>
              {!!pro.socials?.length && (
                <div className="mt-6">
                  <div className="mb-2 text-sm font-semibold">Social links</div>
                  <div className="flex flex-wrap gap-2">
                    {pro.socials.map(social => (
                      <a key={social.platform} href={social.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-sm capitalize hover:bg-accent">
                        {social.platform}<ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {!!pro.gallery?.length && (
                <div className="mt-6">
                  <ReferenceGallery items={pro.gallery} />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
