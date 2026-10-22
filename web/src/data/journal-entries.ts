export type JournalLinkEntry = {
  category: "journal" | "music";
  tag: string;
  title: string;
  href: string;
  description?: string;
};

export type JournalEmbedEntry = {
  category: "music";
  tag: string;
  title: string;
  embedTitle: string;
  embedSrc: string;
};

export const journalLinkEntries = [
  {
    category: "journal",
    tag: "VLOG — EP. 09",
    title: "MOCHILÃO EUROPEU #09 — Uma última noite sem ter onde dormir 🇪🇸",
    href: "https://youtu.be/gSXH2HshB7Q",
  },
  {
    category: "journal",
    tag: "VLOG — EP. 08",
    title: "MOCHILÃO EUROPEU #08 — O último grande rolê do mochilão 🇫🇷",
    href: "https://youtu.be/IOdOtKANVhE",
  },
  {
    category: "journal",
    tag: "VLOG — EP. 07",
    title: "MOCHILÃO EUROPEU #07 — Nos perdemos em Amsterdã 🇳🇱",
    href: "https://youtu.be/gDCeaHNBvns",
  },
  {
    category: "journal",
    tag: "VLOG — EP. 06",
    title: "MOCHILÃO EUROPEU #06 — Berlim foi uma das melhores cidades da viagem 🇩🇪",
    href: "https://youtu.be/vs9SUEXdTzs",
  },
  {
    category: "journal",
    tag: "VLOG — EP. 05",
    title: "MOCHILÃO EUROPEU #05 — 24 horas em uma das cidades mais bonitas da Europa 🇦🇹",
    href: "https://youtu.be/e9BM5-p3lxY",
  },
  {
    category: "journal",
    tag: "VLOG — EP. 04",
    title: "MOCHILÃO EUROPEU #04 — O dia mais longo da viagem em Veneza 🇮🇹",
    href: "https://youtu.be/7oFk2svh4aQ",
  },
  {
    category: "journal",
    tag: "VLOG — EP. 03",
    title: "MOCHILÃO EUROPEU #03 — Roma foi ainda melhor do que imaginávamos 🇮🇹",
    href: "https://youtu.be/83ooi-9GIZ4",
  },
  {
    category: "journal",
    tag: "VLOG — EP. 02",
    title: "MOCHILÃO EUROPEU #02 — Giro de bike por Barcelona 🇪🇸",
    href: "https://youtu.be/ThG0i-xrYPU",
  },
  {
    category: "journal",
    tag: "VLOG — EP. 01",
    title: "MOCHILÃO EUROPEU #01 — De São Paulo para Madrid 🇧🇷✈️🇪🇸",
    href: "https://youtu.be/9R2rgYbEwYw",
  },
  {
    category: "music",
    tag: "MÚSICA — DJ SET",
    title: "Sunset House Mix | Afro House, Funk & Groove (Brazil) | Quadrooss & Icaro",
    href: "https://www.youtube.com/watch?v=_ulL4yRBivw",
    description: "QUADROOSS",
  },
  {
    category: "music",
    tag: "MÚSICA — DJ SET",
    title: "House Mix | Quadrooss & Icaro",
    href: "https://www.youtube.com/watch?v=UMikgoz4mBE",
    description: "QUADROOSS",
  },
  {
    category: "music",
    tag: "MÚSICA — DJ SET",
    title: "House/Tech House Mix 2026 - QUADROOSS @ Hype Sessions #3",
    href: "https://www.youtube.com/watch?v=m19tpABPtZs",
    description: "HYPE FLORIPA",
  },
] satisfies readonly JournalLinkEntry[];

export const journalEmbedEntries = [
  {
    category: "music",
    tag: "MÚSICA — SOUNDCLOUD",
    title: "House Mix | Quadrooss & Icaro",
    embedTitle: "House Mix | Quadrooss & Icaro",
    embedSrc:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/quati-canal&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true",
  },
] satisfies readonly JournalEmbedEntry[];
