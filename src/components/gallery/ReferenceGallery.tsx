import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Image, Play } from "lucide-react";
import type { GalleryItem } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type ReferenceGalleryProps = {
  items: GalleryItem[];
  title?: string;
};

export function ReferenceGallery({ items, title = "Reference work" }: ReferenceGalleryProps) {
  const media = useMemo(() => items.filter(item => item.url), [items]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex === null ? null : media[activeIndex];
  const hasMany = media.length > 1;

  function open(index: number) {
    setActiveIndex(index);
  }

  function close() {
    setActiveIndex(null);
  }

  function previous() {
    setActiveIndex(index => index === null ? index : (index - 1 + media.length) % media.length);
  }

  function next() {
    setActiveIndex(index => index === null ? index : (index + 1) % media.length);
  }

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, media.length]);

  if (!media.length) return null;

  return (
    <div>
      <div className="mb-2 text-sm font-semibold">{title}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {media.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => open(index)}
            className="group overflow-hidden rounded-lg border border-border bg-card text-left transition hover:-translate-y-0.5 hover:shadow-warm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <div className="relative aspect-video bg-muted">
              {item.type === "video" ? (
                <video src={item.url} className="h-full w-full object-cover" muted playsInline />
              ) : (
                <img src={item.url} alt={item.caption || item.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
              )}
              <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-xs">
                {item.type === "video" ? <Play className="h-3.5 w-3.5" /> : <Image className="h-3.5 w-3.5" />}
                {item.type === "video" ? "Video" : "Image"}
              </div>
            </div>
            {(item.caption || item.name) && <div className="p-2 text-sm">{item.caption || item.name}</div>}
          </button>
        ))}
      </div>

      <Dialog open={activeIndex !== null} onOpenChange={open => !open && close()}>
        <DialogContent className="max-h-[92vh] max-w-5xl gap-3 border border-mango/20 bg-warm p-3 shadow-warm sm:rounded-xl">
          <div className="sr-only">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>Use the previous and next buttons to view reference work.</DialogDescription>
          </div>

          {activeItem && (
            <div className="space-y-3">
              <div className="relative grid min-h-[260px] place-items-center overflow-hidden rounded-lg border border-mango/15 bg-[linear-gradient(135deg,hsl(var(--mango)/0.16),hsl(var(--warm)),hsl(var(--gold)/0.12))] sm:min-h-[520px]">
                {activeItem.type === "video" ? (
                  <video key={activeItem.id} src={activeItem.url} className="max-h-[72vh] w-full object-contain" controls autoPlay />
                ) : (
                  <img src={activeItem.url} alt={activeItem.caption || activeItem.name} className="max-h-[72vh] w-full object-contain" />
                )}

                {hasMany && (
                  <>
                    <Button type="button" variant="secondary" size="icon" className="absolute left-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-background/90" onClick={previous} aria-label="Previous reference item">
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button type="button" variant="secondary" size="icon" className="absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-background/90" onClick={next} aria-label="Next reference item">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
                <div>
                  <div className="font-medium">{activeItem.caption || activeItem.name}</div>
                  <div className="text-muted-foreground">{activeIndex! + 1} of {media.length}</div>
                </div>
                {hasMany && (
                  <div className="flex gap-1">
                    {media.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        aria-label={`Go to reference item ${index + 1}`}
                        className={`h-2.5 w-2.5 rounded-full ${index === activeIndex ? "bg-mango" : "bg-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
