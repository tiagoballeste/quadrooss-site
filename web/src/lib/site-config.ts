export const siteConfig = {
  name: "Quadrooss",
  // Public address. Change here when a custom domain is connected on Cloudflare Pages.
  url: "https://quadrooss-site.pages.dev",
  description:
    "Direção, audiovisual, fotografia, música, moda e cultura por Pedro Quadros.",
  wordmark: "(((quadrooss)))",
  email: "cttquadrooss@gmail.com",
  phone: {
    e164: "+5511949202345",
    display: "(+55) 11 94920-2345",
    whatsapp: "https://wa.me/5511949202345",
  },
  location: "São Paulo, Brasil",
  availability: "Disponível para projetos no mundo todo",
} as const;

export const siteNavigation = [
  { label: "Work", href: "/work" },
  { label: "Archive", href: "/archive" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/quadrooss/",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UC4xAbYxpbcxeWGhW6VPXCQQ",
  },
  {
    label: "SoundCloud",
    href: "https://on.soundcloud.com/FJppKmQt8D0te6Tokn",
  },
] as const;
