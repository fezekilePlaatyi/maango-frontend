import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicNav } from "@/components/layout/PublicNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { login, signInWithGoogle, useAppDispatch, useAppSelector } from "@/app/store";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Log in — Maango" }] }),
  component: LoginPage,
});

function LoginPage() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { loading } = useAppSelector(s => s.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
      toast.success("Welcome back!");
      nav({ to: "/app/dashboard" });
    } catch (err: any) { toast.error(err.message ?? "Login failed"); }
  }

  async function googleLogin() {
    try {
      const user = await dispatch(signInWithGoogle({ role: "client" })).unwrap();
      toast.success("Welcome back!");
      nav({ to: user.role === "pro" ? "/app/pro/dashboard" : "/app/dashboard" });
    } catch (err: any) { toast.error(err.message ?? "Google sign-in failed"); }
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-12">
        <Card className="p-6">
          <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Log in to your Maango account.</p>
          <Button type="button" variant="outline" className="mt-6 w-full" onClick={googleLogin} disabled={loading}>
            <span className="mr-2 grid h-5 w-5 place-items-center rounded-full border text-xs font-semibold text-charcoal">G</span>
            Continue with Google
          </Button>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>Email login</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div className="space-y-1"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <Button type="submit" variant="mango" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Log in"}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account? <Link to="/auth/register" className="font-medium text-mango">Sign up</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
