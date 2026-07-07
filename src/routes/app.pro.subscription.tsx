import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/app/pro/subscription")({ component: SubPage });

function SubPage() {
  const router = useRouter();

  useEffect(() => {
    router.navigate({ to: "/app/pro/billing", replace: true });
  }, [router]);

  return null;
}
