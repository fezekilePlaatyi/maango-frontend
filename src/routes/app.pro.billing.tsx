import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cancelSub, fetchInvoices, fetchMyPro, fetchPlans, subscribe, useAppDispatch, useAppSelector } from "@/app/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currency, subscriptionBadge } from "@/lib/permissions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlanCard } from "@/components/cards/PlanCard";
import { SubscriptionBanner } from "@/components/feedback/Subscription";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/app/pro/billing")({ component: Billing });

function Billing() {
  const user = useAppSelector(s => s.auth.user);
  const pro = useAppSelector(s => s.pro.profile);
  const invoices = useAppSelector(s => s.payments.invoices);
  const plans = useAppSelector(s => s.payments.plans);
  const dispatch = useAppDispatch();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchMyPro(user.id));
    dispatch(fetchInvoices(user.id));
    dispatch(fetchPlans());
  }, [user, dispatch]);

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    const paymentStatus = new URLSearchParams(window.location.search).get("payment");
    if (paymentStatus !== "success") return;

    let stopped = false;
    let attempts = 0;
    const refresh = async () => {
      attempts += 1;
      const profile = await dispatch(fetchMyPro(user.id)).unwrap().catch(() => null);
      dispatch(fetchInvoices(user.id));
      if (profile?.subscription.status === "active" || attempts >= 8) {
        stopped = true;
        if (profile?.subscription.status === "active") toast.success("Payment confirmed. Your leads are unlocked.");
      }
    };

    refresh();
    const timer = window.setInterval(() => {
      if (stopped) {
        window.clearInterval(timer);
        return;
      }
      refresh();
    }, 2500);

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [user, dispatch]);

  if (!pro) return null;
  const b = subscriptionBadge(pro.subscription.status);
  const checkoutPlan = pro.subscription.plan ?? "starter";

  async function pick(planId: string) {
    if (!user) return;
    setLoadingId(planId);
    try {
      await dispatch(subscribe({ proId: user.id, planId })).unwrap();
      toast.success("Redirecting to PayFast checkout...");
    } catch (err: any) {
      toast.error(err.message ?? "Checkout failed");
      setLoadingId(null);
    }
  }

  async function cancel() {
    if (!user) return;
    setCanceling(true);
    try {
      await dispatch(cancelSub(user.id)).unwrap();
      toast.success("Subscription canceled. You can activate a new plan now.");
      dispatch(fetchMyPro(user.id));
    } catch (err: any) {
      toast.error(err.message ?? "Cancel failed");
    } finally {
      setCanceling(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Billing & plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your Maango subscription, payment status, and invoices.</p>
      </div>
      {["pending", "past_due"].includes(pro.subscription.status) && (
        <SubscriptionBanner
          pro={pro}
          onContinueCheckout={() => pick(checkoutPlan)}
          continuing={loadingId === checkoutPlan}
          showDefaultAction={false}
        />
      )}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Current plan</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-display text-xl font-semibold capitalize">{pro.subscription.plan ?? "None"}</span>
              <Badge variant="outline">{b.label}</Badge>
            </div>
            {pro.subscription.status === "none" && <div className="mt-1 text-sm text-muted-foreground">Choose a plan below to unlock matching leads.</div>}
            {pro.subscription.renewsAt && <div className="mt-1 text-xs text-muted-foreground">Renews {new Date(pro.subscription.renewsAt).toLocaleDateString()}</div>}
          </div>
          {pro.subscription.status === "active" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="warm">Cancel plan</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    For testing, this will immediately unlock plan activation again. Later we can keep access active until the renewal date.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep plan</AlertDialogCancel>
                  <AlertDialogAction onClick={cancel} disabled={canceling} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {canceling ? "Canceling..." : "Cancel plan"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map(p => (
          <PlanCard key={p.id} plan={p}
            current={pro.subscription.plan === p.id && pro.subscription.status === "active"}
            loading={loadingId === p.id}
            onSelect={() => pick(p.id)} />
        ))}
      </div>

      <Card className="p-0">
        <div className="border-b px-6 py-4"><h2 className="font-display text-lg font-semibold">Invoices</h2></div>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Date</TableHead><TableHead>Plan</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No invoices yet</TableCell></TableRow>}
            {invoices.map(i => (
              <TableRow key={i.id}>
                <TableCell>{new Date(i.date).toLocaleDateString()}</TableCell>
                <TableCell className="capitalize">{i.plan}</TableCell>
                <TableCell>{currency(i.amount)}</TableCell>
                <TableCell><Badge variant={i.status === "paid" ? "default" : "destructive"} className={i.status === "paid" ? "bg-leaf text-leaf-foreground" : ""}>{i.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
