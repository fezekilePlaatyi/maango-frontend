import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, BadgeCheck, BriefcaseBusiness, ClipboardList, CreditCard, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { adminApi } from "@/api/realApi";
import { currency } from "@/lib/permissions";

export const Route = createFileRoute("/app/admin/dashboard")({ component: AdminDash });

function AdminDash() {
  const [data, setData] = useState<Awaited<ReturnType<typeof adminApi.overview>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setData(await adminApi.overview());
    } catch (err: any) {
      setError(err.message ?? "Could not load platform overview");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div>
        <h1 className="font-display text-3xl font-semibold">Platform overview</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <h1 className="font-display text-3xl font-semibold">Platform overview</h1>
        <Card className="mt-6 p-6">
          <div className="font-medium">Could not load overview</div>
          <p className="mt-1 text-sm text-muted-foreground">{error || "Please try again."}</p>
          <Button className="mt-4" variant="outline" onClick={load}>Retry</Button>
        </Card>
      </div>
    );
  }

  const tiles = [
    { l: "Clients", v: data.clients, icon: Users },
    { l: "Providers", v: data.pros, icon: BriefcaseBusiness },
    { l: "Active subs", v: data.activeSubs, icon: CreditCard },
    { l: "Pending pros", v: data.pendingPros, icon: BadgeCheck },
    { l: "Open requests", v: data.openRequests, icon: ClipboardList },
    { l: "Total requests", v: data.requests, icon: Activity },
    { l: "Revenue (MTD)", v: currency(data.revenueMTD), icon: CreditCard },
  ];
  const userBreakdown = [
    { name: "Clients", value: data.clients, fill: "var(--mango)" },
    { name: "Providers", value: data.pros, fill: "var(--leaf)" },
  ];
  const operations = [
    { name: "Open requests", value: data.openRequests },
    { name: "Total requests", value: data.requests },
    { name: "Active subs", value: data.activeSubs },
    { name: "Pending pros", value: data.pendingPros },
  ];
  const providerStatus = [
    { name: "Verified", value: Math.max(data.pros - data.pendingPros, 0), fill: "var(--leaf)" },
    { name: "Needs review", value: data.pendingPros, fill: "var(--gold)" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Platform overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">Live operational health from Maango users, providers, requests, and subscriptions.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(t => (
          <Card key={t.l} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground">{t.l}</div>
                <div className="mt-1 font-display text-3xl font-semibold">{t.v}</div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-md bg-mango-soft text-mango">
                <t.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="font-display text-xl font-semibold">Operations snapshot</div>
          <ChartContainer
            className="mt-4 h-72 w-full"
            config={{ value: { label: "Count", color: "var(--mango)" } }}
          >
            <BarChart data={operations}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="var(--mango)" />
            </BarChart>
          </ChartContainer>
        </Card>

        <Card className="p-5">
          <div className="font-display text-xl font-semibold">Users</div>
          <ChartContainer
            className="mt-4 h-72 w-full"
            config={{
              clients: { label: "Clients", color: "var(--mango)" },
              pros: { label: "Providers", color: "var(--leaf)" },
            }}
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={userBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                {userBreakdown.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
              </Pie>
            </PieChart>
          </ChartContainer>
        </Card>

        <Card className="p-5">
          <div className="font-display text-xl font-semibold">Provider review</div>
          <ChartContainer
            className="mt-4 h-64 w-full"
            config={{
              verified: { label: "Verified", color: "var(--leaf)" },
              pending: { label: "Needs review", color: "var(--gold)" },
            }}
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={providerStatus} dataKey="value" nameKey="name" outerRadius={85}>
                {providerStatus.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
              </Pie>
            </PieChart>
          </ChartContainer>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="font-display text-xl font-semibold">Revenue</div>
          <div className="mt-6 flex items-end justify-between gap-6">
            <div>
              <div className="text-sm text-muted-foreground">Month to date</div>
              <div className="mt-1 font-display text-5xl font-semibold">{currency(data.revenueMTD)}</div>
            </div>
            <div className="h-24 flex-1 rounded-md bg-gradient-to-r from-mango-soft via-gold/20 to-leaf-soft" />
          </div>
        </Card>
      </div>
    </div>
  );
}
