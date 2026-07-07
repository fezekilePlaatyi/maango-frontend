import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicNav, Footer } from "@/components/layout/PublicNav";
import { ProviderCard } from "@/components/cards/ProviderCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi, prosApi } from "@/api/realApi";
import type { Category, ProProfile } from "@/types";

interface SearchParams { q?: string; city?: string; category?: string; }

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: (s.q as string) || undefined,
    city: (s.city as string) || undefined,
    category: (s.category as string) || undefined,
  }),
  head: () => ({ meta: [{ title: "Find home service pros — Maango" }, { name: "description", content: "Search verified providers by service and location." }] }),
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  const nav = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const [city, setCity] = useState(search.city ?? "");
  const [category, setCategory] = useState(search.category ?? "all");
  const [results, setResults] = useState<ProProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.listCategories().then(setCategories).catch(() => setCategories([])); }, []);

  useEffect(() => {
    setLoading(true);
    prosApi.search({ text: search.q, city: search.city, category: search.category })
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [search.q, search.city, search.category]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    nav({ search: { q: q || undefined, city: city || undefined, category: category === "all" ? undefined : category } });
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-semibold">Find a pro</h1>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-3 sm:flex-row">
          <Input placeholder="Search — plumber, painter…" value={q} onChange={e => setQ(e.target.value)} />
          <Input placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="sm:w-56"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <button type="submit" className="rounded-md bg-gradient-mango px-4 text-sm font-medium text-mango-foreground shadow-warm">Search</button>
        </form>

        <div className="mt-6 text-sm text-muted-foreground">{loading ? "Searching…" : `${results.length} provider${results.length === 1 ? "" : "s"}`}</div>

        {loading ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : results.length === 0 ? (
          <div className="mt-6"><EmptyState icon="🔍" title="No pros match those filters" body="Try broader terms or clear a filter." /></div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {results.map(p => <ProviderCard key={p.userId} pro={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
