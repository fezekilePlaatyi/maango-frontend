import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAppSelector } from "@/app/store";
import { supportApi } from "@/api/realApi";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/support")({ component: Support });

function Support() {
  const user = useAppSelector(s => s.auth.user);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    await supportApi.createTicket(user.id, subject, message);
    toast.success("Ticket sent — we'll get back within 24 hours");
    setSubject(""); setMessage(""); setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">Support</h1>
      <p className="mt-1 text-sm text-muted-foreground">We usually respond in a few hours.</p>
      <Card className="mt-6 p-6">
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} required /></div>
          <div><Label>Message</Label><Textarea rows={5} value={message} onChange={e => setMessage(e.target.value)} required /></div>
          <Button variant="mango" disabled={loading}>{loading ? "Sending…" : "Send ticket"}</Button>
        </form>
      </Card>
    </div>
  );
}
