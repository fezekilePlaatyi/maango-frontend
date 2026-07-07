import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2, ExternalLink, MapPin, Phone, UserRound } from "lucide-react";
import { fetchMyPro, setUser, useAppDispatch, useAppSelector } from "@/app/store";
import { usersApi } from "@/api/realApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReferenceGallery } from "@/components/gallery/ReferenceGallery";

export const Route = createFileRoute("/app/profile")({ component: Profile });

function Profile() {
  const user = useAppSelector(s => s.auth.user);
  const pro = useAppSelector(s => s.pro.profile);
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  useEffect(() => {
    if (user?.role === "pro") dispatch(fetchMyPro(user.id));
  }, [dispatch, user]);
  useEffect(() => {
    setPhone(user?.phone ?? "");
  }, [user?.phone]);

  if (!user) return null;

  async function savePhone(e: React.FormEvent) {
    e.preventDefault();
    const value = phone.trim();
    if (value && !/^[+0-9 ()-]{7,20}$/.test(value)) {
      toast.error("Please enter a valid cellphone number.");
      return;
    }
    setSavingPhone(true);
    try {
      const updated = await usersApi.update(user.id, { phone: value || undefined });
      dispatch(setUser(updated));
      toast.success("Cellphone number saved");
    } catch (err: any) {
      toast.error(err.message ?? "Could not save cellphone number");
    } finally {
      setSavingPhone(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-3xl font-semibold">Profile</h1>
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <UserRound className="h-5 w-5 text-mango" />
          <h2 className="font-display text-xl font-semibold">Account details</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-mango font-display text-2xl text-mango-foreground">{user.name.charAt(0)}</div>
          <div>
            <div className="font-display text-xl font-semibold">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
            <Badge variant="outline" className="mt-1 capitalize">{user.role}</Badge>
          </div>
        </div>
        <form onSubmit={savePhone} className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <Label htmlFor="cellphone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-mango" />Cellphone number
            </Label>
            <Input
              id="cellphone"
              className="mt-1"
              value={phone}
              onChange={event => setPhone(event.target.value)}
              placeholder="+27 82 555 0123"
              inputMode="tel"
              autoComplete="tel"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="outline" disabled={savingPhone}>{savingPhone ? "Saving..." : "Save"}</Button>
          </div>
        </form>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
          <div><div className="text-muted-foreground">Joined</div><div>{new Date(user.createdAt).toLocaleDateString()}</div></div>
        </div>
      </Card>

      {user.role === "pro" ? (
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-mango" />
              <h2 className="font-display text-xl font-semibold">Business details</h2>
            </div>
            <Button variant="outline" size="sm" asChild><Link to="/app/pro/onboarding">Edit</Link></Button>
          </div>

          {pro ? (
            <div className="space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-semibold">{pro.businessName || "Business profile"}</h3>
                  <Badge variant="outline" className="capitalize">{pro.status}</Badge>
                  {pro.verified && <Badge className="bg-leaf text-white">Verified</Badge>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{pro.bio || "No business bio added yet."}</p>
              </div>
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div><div className="text-muted-foreground">Primary category</div><div className="capitalize">{pro.category || "—"}</div></div>
                <div><div className="text-muted-foreground">Years experience</div><div>{pro.yearsExperience ?? 0}</div></div>
                <div><div className="text-muted-foreground">Services</div><div>{pro.services?.length ? pro.services.join(", ") : "—"}</div></div>
                <div><div className="text-muted-foreground">Service areas</div><div>{pro.serviceAreas?.length ? pro.serviceAreas.join(", ") : "—"}</div></div>
                <div><div className="text-muted-foreground">Subscription</div><div className="capitalize">{pro.subscription?.status ?? "none"}</div></div>
              </div>
              {!!pro.socials?.length && (
                <div>
                  <div className="mb-2 text-sm font-semibold">Social links</div>
                  <div className="flex flex-wrap gap-2">
                    {pro.socials.map(social => (
                      <a key={social.platform} href={social.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-sm capitalize hover:bg-accent">
                        {social.platform}<ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {!!pro.gallery?.length && <ReferenceGallery items={pro.gallery} />}
            </div>
          ) : (
            <div className="rounded-lg border border-border/60 bg-warm p-4 text-sm text-muted-foreground">
              No business profile yet. Add your business details so clients can find and trust you.
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-mango" />
            <h2 className="font-display text-xl font-semibold">Client details & locations</h2>
          </div>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div><div className="text-muted-foreground">Contact name</div><div>{user.name}</div></div>
            <div><div className="text-muted-foreground">Contact email</div><div>{user.email}</div></div>
            <div><div className="text-muted-foreground">Cellphone</div><div>{user.phone ?? "—"}</div></div>
            <div><div className="text-muted-foreground">Saved locations</div><div>Not added yet</div></div>
          </div>
        </Card>
      )}
    </div>
  );
}
