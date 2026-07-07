import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Search, Sparkles, Wrench, Zap, Leaf, Wind, Truck, Grid3x3, PaintRoller, Paintbrush } from "lucide-react";
import { useEffect, useState } from "react";
import { PublicNav, Footer } from "@/components/layout/PublicNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminApi, prosApi } from "@/api/realApi";
import type { Category, ProProfile } from "@/types";

const iconMap = { Wrench, Zap, Sparkles, PaintRoller, Paintbrush, Leaf, Wind, Truck, Grid3x3 } as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maango — Trusted home service pros, on tap" },
      { name: "description", content: "Post a job. Compare vetted local pros. Hire with confidence." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<ProProfile[]>([]);

  useEffect(() => {
    adminApi.listCategories().then(setCategories).catch(() => setCategories([]));
    prosApi.search({}).then((items) => setFeatured(items.filter((pro) => pro.verified).slice(0, 4))).catch(() => setFeatured([]));
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    nav({ to: "/search", search: { q: q || undefined, city: city || undefined } as any });
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-warm">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-mango/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-leaf/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-charcoal md:text-7xl">
              Trusted home pros,<br /><span className="bg-gradient-mango bg-clip-text text-transparent">on tap.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Post a job, compare quotes from verified local providers, and hire the one you trust. No hidden fees for homeowners — ever.
            </p>

            <form onSubmit={submit} className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-border/60 bg-card p-2 shadow-warm sm:flex-row">
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input value={q} onChange={e => setQ(e.target.value)} placeholder="What do you need? e.g. plumber, painter" className="border-0 bg-transparent shadow-none focus-visible:ring-0" />
              </div>
              <div className="hidden w-px bg-border sm:block" />
              <div className="flex flex-1 items-center gap-2 px-3">
                <span className="text-muted-foreground">📍</span>
                <Input value={city} onChange={e => setCity(e.target.value)} placeholder="City or suburb" className="border-0 bg-transparent shadow-none focus-visible:ring-0" />
              </div>
              <Button type="submit" variant="mango" size="lg">Find pros<ArrowRight className="h-4 w-4" /></Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-leaf" />ID + business verified</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-leaf" />Real reviews</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-leaf" />Free for homeowners</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold">Browse by category</h2>
          <Link to="/search" className="text-sm text-muted-foreground hover:text-foreground">See all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map(c => {
            const Icon = iconMap[c.icon as keyof typeof iconMap] ?? Wrench;
            return (
              <Link key={c.id} to="/search" search={{ category: c.slug } as any}>
                <Card className="group flex flex-col items-center gap-3 p-6 transition-all hover:-translate-y-0.5 hover:border-mango hover:shadow-warm">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-mango-soft text-mango group-hover:bg-gradient-mango group-hover:text-mango-foreground"><Icon className="h-6 w-6" /></div>
                  <div className="font-medium">{c.name}</div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-warm py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl font-semibold">How Maango works</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">Three steps. No spam. Real quotes.</p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", title: "Post your job", body: "Describe what you need — words, photos, budget. Takes 60 seconds." },
              { n: "02", title: "Compare quotes", body: "Verified local pros respond with a price and timeline. You compare side-by-side." },
              { n: "03", title: "Hire with confidence", body: "Chat directly with your pick, get the job done, leave a review." },
            ].map(s => (
              <Card key={s.n} className="p-6">
                <div className="font-display text-4xl font-semibold text-mango">{s.n}</div>
                <h3 className="mt-3 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured pros */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold">Top-rated in your area</h2>
            <p className="mt-1 text-sm text-muted-foreground">A taste of the pros ready to help.</p>
          </div>
          <Link to="/search" className="text-sm text-muted-foreground hover:text-foreground">Browse all →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {featured.map(p => (
            <Card key={p.userId} className="p-5">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-mango font-display text-xl font-semibold text-mango-foreground">{p.businessName.charAt(0)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><h3 className="font-display text-lg font-semibold">{p.businessName}</h3><CheckCircle2 className="h-4 w-4 text-leaf" /></div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.bio}</p>
                  <div className="mt-2 text-xs text-muted-foreground">⭐ {p.rating} · {p.reviewCount} reviews · {p.serviceAreas[0]}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Pro CTA */}
      <section id="pricing" className="bg-charcoal py-20 text-warm">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">For service providers</span>
            <h2 className="mt-4 font-display text-4xl font-semibold">Grow your business with local leads.</h2>
            <p className="mt-3 text-warm/70">Subscribe monthly, get matched to homeowners in your service areas, and respond only to jobs you want. No commission on completed work.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="mango" size="lg" asChild><Link to="/auth/register" search={{ role: "pro" }}>Join as a pro</Link></Button>
              <Button variant="outline" size="lg" className="border-warm/30 bg-transparent text-warm hover:bg-warm/10" asChild><Link to="/app/pro/billing">See pricing</Link></Button>
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { t: "Only pay for reach, not per lead", d: "Predictable monthly subscription — you keep 100% of the job value." },
              { t: "Verified & vetted", d: "Show homeowners the badge that makes them pick you." },
              { t: "Own your customer", d: "Direct chat, no middlemen once the job starts." },
            ].map(x => (
              <div key={x.t} className="rounded-xl border border-warm/10 bg-warm/5 p-4">
                <div className="font-medium">{x.t}</div>
                <div className="text-sm text-warm/60">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
