import type { ProProfile } from "@/types";

export function canRespondToDeals(pro: ProProfile | null | undefined): boolean {
  if (!pro) return false;
  return pro.status === "approved" && (pro.subscription.status === "active" || pro.subscription.status === "trialing");
}

export function canViewFullRequest(pro: ProProfile | null | undefined): boolean {
  return canRespondToDeals(pro);
}

export function subscriptionBadge(status: ProProfile["subscription"]["status"]) {
  switch (status) {
    case "active": return { label: "Active", tone: "leaf" as const };
    case "pending": return { label: "Pending payment", tone: "gold" as const };
    case "trialing": return { label: "Trial", tone: "gold" as const };
    case "past_due": return { label: "Past due", tone: "destructive" as const };
    case "canceled": return { label: "Canceled", tone: "muted" as const };
    default: return { label: "Not subscribed", tone: "muted" as const };
  }
}

export function currency(n: number): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);
}
