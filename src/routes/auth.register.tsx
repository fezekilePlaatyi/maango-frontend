import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { FileCheck2, Upload } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { register, signInWithGoogle, useAppDispatch } from "@/app/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadIdentityDocument } from "@/api/storageApi";
import type { IdentityDocument, IdentityDocumentType, Role } from "@/types";

interface Search { role?: Role }

export const Route = createFileRoute("/auth/register")({
  validateSearch: (s: Record<string, unknown>): Search => ({ role: (s.role as Role) || undefined }),
  head: () => ({ meta: [{ title: "Sign up — Maango" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const search = Route.useSearch();
  const [role, setRole] = useState<Role>(search.role ?? "client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [documentType, setDocumentType] = useState<IdentityDocumentType>("sa_id");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  async function uploadProDocument(): Promise<IdentityDocument | undefined> {
    if (role !== "pro") return undefined;
    if (!documentFile) throw new Error("Please upload your ID document or passport.");
    return uploadIdentityDocument(documentFile, `pending-${crypto.randomUUID()}`, documentType);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const identityDocument = await uploadProDocument();
      await dispatch(register({ email, password, name, role, identityDocument })).unwrap();
      toast.success("Account created");
      nav({ to: role === "pro" ? "/app/pro/onboarding" : "/app/dashboard" });
    } catch (err: any) { toast.error(err.message ?? "Sign up failed"); }
    finally { setLoading(false); }
  }

  async function googleRegister() {
    setLoading(true);
    try {
      const identityDocument = await uploadProDocument();
      await dispatch(signInWithGoogle({ role, identityDocument })).unwrap();
      toast.success("Account ready");
      nav({ to: role === "pro" ? "/app/pro/onboarding" : "/app/dashboard" });
    } catch (err: any) { toast.error(err.message ?? "Google sign-up failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="mx-auto flex max-w-lg flex-col justify-center px-4 py-12">
        <Card className="p-6">
          <h1 className="font-display text-2xl font-semibold">Create your Maango account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose how you want to use Maango.</p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            {(["client", "pro"] as const).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${role === r ? "border-mango bg-mango-soft/50" : "border-border hover:border-mango/50"}`}>
                <div className="text-2xl">{r === "client" ? "🏠" : "🧰"}</div>
                <div className="mt-2 font-medium">{r === "client" ? "I need a pro" : "I am a pro"}</div>
                <div className="text-xs text-muted-foreground">{r === "client" ? "Post jobs & get quotes" : "Get local leads on subscription"}</div>
              </button>
            ))}
          </div>

          <Button type="button" variant="outline" className="mt-6 w-full" onClick={googleRegister} disabled={loading}>
            <span className="mr-2 grid h-5 w-5 place-items-center rounded-full border text-xs font-semibold text-charcoal">G</span>
            Continue with Google as {role === "pro" ? "a provider" : "a client"}
          </Button>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>Email sign-up</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1"><Label htmlFor="name">{role === "pro" ? "Business name" : "Full name"}</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} required /></div>
            <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} autoComplete="new-password" required />
            </div>
            {role === "pro" && (
              <div className="rounded-lg border border-border/60 bg-warm p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <FileCheck2 className="h-4 w-4 text-mango" />
                  Provider verification document
                </div>
                <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                  <div className="space-y-1">
                    <Label>Document type</Label>
                    <Select value={documentType} onValueChange={(v: IdentityDocumentType) => setDocumentType(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sa_id">SA ID document</SelectItem>
                        <SelectItem value="passport">Passport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="identity-document">ID/passport copy</Label>
                    <Input
                      id="identity-document"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={e => setDocumentFile(e.target.files?.[0] ?? null)}
                      required={role === "pro"}
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Upload className="h-3.5 w-3.5" />
                  JPG, PNG, WebP, or PDF. Maximum 10MB.
                </div>
              </div>
            )}
            <Button type="submit" variant="mango" className="w-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Have an account? <Link to="/auth/login" className="font-medium text-mango">Log in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
