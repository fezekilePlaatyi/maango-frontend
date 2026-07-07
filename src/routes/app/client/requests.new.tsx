import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createRequest, useAppDispatch, useAppSelector } from "@/app/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { adminApi } from "@/api/realApi";
import type { Category } from "@/types";

export const Route = createFileRoute("/app/client/requests/new")({ component: PostRequest });

function PostRequest() {
  const user = useAppSelector(s => s.auth.user);
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const [f, setF] = useState({ title: "", description: "", category: "plumbing", city: "", budget: "", urgency: "flexible" as "flexible" | "this_week" | "asap" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { adminApi.listCategories().then(setCategories).catch(() => setCategories([])); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const req = await dispatch(createRequest({ clientId: user.id, input: { title: f.title, description: f.description, category: f.category, city: f.city, budget: f.budget ? Number(f.budget) : undefined, urgency: f.urgency } })).unwrap();
      toast.success("Request posted — pros are being notified");
      nav({ to: `/app/client/requests/${req.id}` });
    } catch (err: any) { toast.error(err.message ?? "Failed to post"); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">Post a request</h1>
      <p className="mt-1 text-sm text-muted-foreground">Describe the job. You'll receive quotes within hours.</p>
      <Card className="mt-6 p-6">
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Title</Label><Input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} placeholder="e.g. Leaking kitchen tap" required /></div>
          <div><Label>Category</Label>
            <Select value={f.category} onValueChange={v => setF({ ...f, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Description</Label><Textarea rows={5} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} placeholder="What's the job? Any specifics that help pros quote accurately." required /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>City / Suburb</Label><Input value={f.city} onChange={e => setF({ ...f, city: e.target.value })} placeholder="Johannesburg" required /></div>
            <div><Label>Budget (optional)</Label><Input type="number" value={f.budget} onChange={e => setF({ ...f, budget: e.target.value })} placeholder="R" /></div>
          </div>
          <div>
            <Label>How urgent?</Label>
            <RadioGroup value={f.urgency} onValueChange={(v: any) => setF({ ...f, urgency: v })} className="mt-2 grid grid-cols-3 gap-2">
              {[{ v: "flexible", l: "Flexible" }, { v: "this_week", l: "This week" }, { v: "asap", l: "ASAP" }].map(o => (
                <label key={o.v} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${f.urgency === o.v ? "border-mango bg-mango-soft/40" : "border-border"}`}>
                  <RadioGroupItem value={o.v} />{o.l}
                </label>
              ))}
            </RadioGroup>
          </div>
          <Button type="submit" variant="mango" disabled={loading}>{loading ? "Posting…" : "Post request"}</Button>
        </form>
      </Card>
    </div>
  );
}
