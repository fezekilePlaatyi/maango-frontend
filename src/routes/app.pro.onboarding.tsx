import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, LinkIcon, Trash2, Video } from "lucide-react";
import { fetchMyPro, submitProApp, useAppDispatch, useAppSelector } from "@/app/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/api/realApi";
import { deleteStoredAsset, uploadGalleryItem } from "@/api/storageApi";
import type { Category, GalleryItem, SocialLink, SocialPlatform } from "@/types";

export const Route = createFileRoute("/app/pro/onboarding")({ component: Onboarding });

const socialPlatforms: { value: SocialPlatform; label: string }[] = [
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter / X" },
  { value: "pinterest", label: "Pinterest" },
];

function isValidSocialUrl(platform: SocialPlatform, value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const matches: Record<SocialPlatform, boolean> = {
      tiktok: host.endsWith("tiktok.com"),
      facebook: host.endsWith("facebook.com"),
      linkedin: host.endsWith("linkedin.com"),
      twitter: host.endsWith("twitter.com") || host.endsWith("x.com"),
      pinterest: host.endsWith("pinterest.com"),
    };
    return ["http:", "https:"].includes(url.protocol) && matches[platform];
  } catch {
    return false;
  }
}

function Onboarding() {
  const user = useAppSelector(s => s.auth.user);
  const pro = useAppSelector(s => s.pro.profile);
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const [f, setF] = useState({ businessName: "", bio: "", category: "plumbing", services: "", serviceAreas: "", yearsExperience: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) dispatch(fetchMyPro(user.id)); }, [user, dispatch]);
  useEffect(() => { adminApi.listCategories().then(setCategories).catch(() => setCategories([])); }, []);
  useEffect(() => {
    if (pro) {
      setF(x => ({ ...x, businessName: pro.businessName, bio: pro.bio, category: pro.category, services: pro.services.join(", "), serviceAreas: pro.serviceAreas.join(", "), yearsExperience: pro.yearsExperience }));
      setGallery(pro.gallery ?? []);
      setSocials(pro.socials ?? []);
    }
  }, [pro]);

  async function addGalleryFiles(files: FileList | null) {
    if (!user || !files?.length) return;
    if (gallery.length + files.length > 12) {
      toast.error("Gallery can contain up to 12 reference items.");
      return;
    }
    setUploadingGallery(true);
    try {
      const uploaded = await Promise.all([...files].map(file => uploadGalleryItem(file, user.id)));
      setGallery(items => [...items, ...uploaded]);
      toast.success("Reference work added");
    } catch (err: any) {
      toast.error(err.message ?? "Could not upload reference work");
    } finally {
      setUploadingGallery(false);
    }
  }

  async function removeGalleryItem(item: GalleryItem) {
    setGallery(items => items.filter(x => x.id !== item.id));
    deleteStoredAsset(item.storagePath).catch(() => undefined);
  }

  function addSocial() {
    const platform = socialPlatforms.find(option => !socials.some(social => social.platform === option.value))?.value;
    if (!platform) {
      toast.error("You already added all supported social platforms.");
      return;
    }
    setSocials(items => [...items, { platform, url: "" }]);
  }

  function updateSocial(index: number, patch: Partial<SocialLink>) {
    setSocials(items => items.map((item, i) => i === index ? { ...item, ...patch } : item));
  }

  function removeSocial(index: number) {
    setSocials(items => items.filter((_, i) => i !== index));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const invalidSocial = socials.find(social => social.url && !isValidSocialUrl(social.platform, social.url));
    if (invalidSocial) {
      toast.error(`Please enter a valid ${invalidSocial.platform} URL.`);
      return;
    }
    setLoading(true);
    try {
      await dispatch(submitProApp({ userId: user.id, patch: {
        businessName: f.businessName, bio: f.bio, category: f.category,
        services: f.services.split(",").map(s => s.trim()).filter(Boolean),
        serviceAreas: f.serviceAreas.split(",").map(s => s.trim()).filter(Boolean),
        yearsExperience: Number(f.yearsExperience),
        gallery,
        socials: socials.filter(social => social.url.trim()),
      }})).unwrap();
      toast.success("Application submitted for review");
      nav({ to: "/app/pro/dashboard" });
    } catch (err: any) { toast.error(err.message ?? "Failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">Business profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Complete every section so we can verify and match you fast.</p>
      <Card className="mt-6 p-6">
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Business name</Label><Input value={f.businessName} onChange={e => setF({ ...f, businessName: e.target.value })} required /></div>
          <div><Label>Short bio</Label><Textarea rows={3} value={f.bio} onChange={e => setF({ ...f, bio: e.target.value })} placeholder="What makes your business trustworthy?" required /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Primary category</Label>
              <Select value={f.category} onValueChange={v => setF({ ...f, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Years experience</Label><Input type="number" value={f.yearsExperience} onChange={e => setF({ ...f, yearsExperience: Number(e.target.value) })} /></div>
          </div>
          <div><Label>Services offered (comma-separated)</Label><Input value={f.services} onChange={e => setF({ ...f, services: e.target.value })} placeholder="Leak repair, geyser install" /></div>
          <div><Label>Service areas (comma-separated)</Label><Input value={f.serviceAreas} onChange={e => setF({ ...f, serviceAreas: e.target.value })} placeholder="Johannesburg, Sandton" /></div>

          <div className="rounded-lg border border-border/60 bg-warm p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold"><ImagePlus className="h-4 w-4 text-mango" />Reference work</div>
                <p className="mt-1 text-xs text-muted-foreground">Upload completed work. Images and short videos work best.</p>
              </div>
              <Button type="button" variant="outline" size="sm" disabled={uploadingGallery || gallery.length >= 12} asChild>
                <label className="cursor-pointer">
                  {uploadingGallery ? "Uploading..." : "Add media"}
                  <input className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" onChange={e => addGalleryFiles(e.target.files)} />
                </label>
              </Button>
            </div>
            {gallery.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-background/60 p-5 text-center text-sm text-muted-foreground">No reference work added yet.</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {gallery.map(item => (
                  <div key={item.id} className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="relative aspect-video bg-muted">
                      {item.type === "video" ? (
                        <video src={item.url} className="h-full w-full object-cover" controls />
                      ) : (
                        <img src={item.url} alt={item.caption || item.name} className="h-full w-full object-cover" />
                      )}
                      <div className="absolute left-2 top-2 rounded-md bg-background/85 px-2 py-1 text-xs">
                        {item.type === "video" ? <Video className="inline h-3.5 w-3.5" /> : "Image"}
                      </div>
                    </div>
                    <div className="space-y-2 p-3">
                      <Input value={item.caption ?? ""} placeholder="Caption, e.g. Bathroom tiling in Sandton" onChange={e => setGallery(items => items.map(x => x.id === item.id ? { ...x, caption: e.target.value } : x))} />
                      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => removeGalleryItem(item)}>
                        <Trash2 className="h-4 w-4" />Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border/60 bg-warm p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold"><LinkIcon className="h-4 w-4 text-mango" />Social links</div>
                <p className="mt-1 text-xs text-muted-foreground">Choose from TikTok, Facebook, LinkedIn, Twitter / X, or Pinterest.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addSocial}>Add link</Button>
            </div>
            <div className="space-y-3">
              {socials.length === 0 && <div className="text-sm text-muted-foreground">No social links added.</div>}
              {socials.map((social, index) => (
                <div key={`${social.platform}-${index}`} className="grid gap-2 sm:grid-cols-[170px_1fr_auto]">
                  <Select value={social.platform} onValueChange={(value: SocialPlatform) => updateSocial(index, { platform: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {socialPlatforms.map(option => (
                        <SelectItem key={option.value} value={option.value} disabled={socials.some((item, i) => i !== index && item.platform === option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input value={social.url} onChange={e => updateSocial(index, { url: e.target.value })} placeholder="https://..." />
                  <Button type="button" variant="outline" size="icon" aria-label="Remove social link" onClick={() => removeSocial(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" variant="mango" disabled={loading}>{loading ? "Submitting…" : "Submit for verification"}</Button>
        </form>
      </Card>
    </div>
  );
}
