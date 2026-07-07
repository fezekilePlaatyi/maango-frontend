import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { store } from "../app/store";

const seoTitle = "Maango - Trusted Home Service Pros in South Africa";
const seoDescription = "Post a job, compare vetted local pros, and hire with confidence. Maango connects South African homeowners with subscribed, verified service providers.";
const siteUrl = "https://myqwiktip-dev.web.app";
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Maango",
  url: siteUrl,
  description: seoDescription,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mango-soft text-4xl">🥭</div>
        <h1 className="mt-6 font-display text-6xl font-semibold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page has ripened and fallen off the tree.</p>
        <a href="/" className="mt-6 inline-flex items-center justify-center rounded-full bg-mango px-5 py-2 text-sm font-medium text-mango-foreground hover:opacity-90">
          Back to Maango
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold">Something went sour</h1>
        <p className="mt-2 text-sm text-muted-foreground">We hit a snag rendering this page.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-full bg-mango px-4 py-2 text-sm text-mango-foreground">Try again</button>
          <a href="/" className="rounded-full border px-4 py-2 text-sm">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: seoTitle },
      { name: "description", content: seoDescription },
      { name: "keywords", content: "Maango, home services South Africa, plumbers, electricians, cleaners, painters, local service providers, home repairs" },
      { name: "author", content: "Maango" },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#eb8b22" },
      { name: "application-name", content: "Maango" },
      { name: "apple-mobile-web-app-title", content: "Maango" },
      { property: "og:title", content: seoTitle },
      { property: "og:description", content: seoDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl },
      { property: "og:site_name", content: "Maango" },
      { property: "og:locale", content: "en_ZA" },
      { property: "og:image", content: `${siteUrl}/android-chrome-512x512.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: seoTitle },
      { name: "twitter:description", content: seoDescription },
      { name: "twitter:image", content: `${siteUrl}/android-chrome-512x512.png` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/android-chrome-192x192.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "canonical", href: siteUrl },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ReduxProvider>
  );
}
