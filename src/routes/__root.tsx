import {
  Outlet,
  Link,
  createRootRoute,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LanguageProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { MotionConfig } from "motion/react";
import { Atmosphere, SmoothScroll } from "@/components/site/Atmosphere";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-night-glow px-4">
      <div className="max-w-md text-center">
        <h1 className="text-gradient text-7xl font-extrabold">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Sahifa topilmadi</h2>
        <p className="mt-2 text-sm text-muted-foreground">Siz qidirgan sahifa yo‘q yoki boshqa joyga ko‘chirilgan.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Bosh sahifaga
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Sahifa yuklanmadi</h1>
        <p className="mt-2 text-sm text-muted-foreground">Nimadir xato ketdi. Qayta urinib ko‘ring yoki bosh sahifaga qayting.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Qayta urinish
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
          >
            Bosh sahifa
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ONE Ecosystem — Barchasi biz bilan" },
      { name: "description", content: "ONE — tadbirkorlar va marketpleys sotuvchilari uchun bitta ekotizim." },
      { name: "author", content: "ONE Ecosystem" },
      { name: "theme-color", content: "#0D0817" },
      { property: "og:site_name", content: "ONE Ecosystem" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <SmoothScroll />
        <Atmosphere />
        <Outlet />
        <Toaster />
      </LanguageProvider>
    </MotionConfig>
  );
}
