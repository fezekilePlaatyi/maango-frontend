import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/app")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("maango.auth.v1");
    if (!raw) throw redirect({ to: "/auth/login" });
  },
  component: AppShell,
});
