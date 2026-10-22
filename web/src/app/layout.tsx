import type { Metadata } from "next";
import Script from "next/script";
import { PageLoader } from "@/components/page-loader";
import { PageTransitionProvider } from "@/components/page-transition";
import { HERO_VIDEO_POSTER, PersistentHeroVideo } from "@/components/persistent-hero-video";
import { SmoothScroll } from "@/components/smooth-scroll";
import "lenis/dist/lenis.css";
import "./design-system.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Quadrooss",
    template: "%s — Quadrooss",
  },
  description:
    "Direção, audiovisual, fotografia, música, moda e cultura por Pedro Quadros.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const loaderEnabled = process.env.NEXT_PUBLIC_PAGE_LOADER !== "false";

  return (
    <html lang="pt-BR" className={loaderEnabled ? "has-page-loader" : undefined}>
      <head>
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" />
        <link rel="preconnect" href="https://f.vimeocdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://player.vimeo.com" />
        <link rel="dns-prefetch" href="https://i.vimeocdn.com" />
        <link rel="preload" as="image" href={HERO_VIDEO_POSTER} fetchPriority="high" />
        <Script id="reset-scroll-restoration" strategy="beforeInteractive">
          {"if('scrollRestoration' in history){history.scrollRestoration='manual'}scrollTo(0,0);"}
        </Script>
      </head>
      <body>
        <SmoothScroll />
        <PersistentHeroVideo />
        <PageLoader enabled={loaderEnabled} />
        <PageTransitionProvider>
          {children}
        </PageTransitionProvider>
      </body>
    </html>
  );
}
