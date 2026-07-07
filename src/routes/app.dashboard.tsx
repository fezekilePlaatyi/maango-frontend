import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/dashboard")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("maango.auth.v1");
    if (!raw) throw redirect({ to: "/auth/login" });
    const u = JSON.parse(raw);
    if (u.role === "client") throw redirect({ to: "/app/client/dashboard" });
    if (u.role === "pro") throw redirect({ to: "/app/pro/dashboard" });
    if (u.role === "admin") throw redirect({ to: "/app/admin/dashboard" });
  },
  component: () => null,
});
