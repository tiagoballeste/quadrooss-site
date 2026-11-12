import type { Locale } from "@/lib/i18n";

/*
 * Work credits are written in Portuguese in src/data/work/credits.json. On the
 * English pages each role label goes through this map; labels already in
 * English, or names, pass through unchanged.
 */
const CREDIT_LABELS_EN: Record<string, string> = {
  "Gravado por": "Filmed by",
  "Editado por": "Edited by",
  "Gravado e editado por": "Filmed and edited by",
  "Direção": "Direction",
  "Direção criativa": "Creative direction",
  "Direção geral": "General direction",
  "Direção executiva": "Executive direction",
  "Direção e Edição por": "Directed and edited by",
  "Ass. direção": "Assistant director",
  "Edição": "Editing",
  "Produção executiva": "Executive production",
  "Produção": "Production",
  "Produção do evento": "Event production",
  "Produção audiovisual": "Video production",
  "Produção musical": "Music production",
  "Produzido por": "Produced by",
  "Uma produção": "A production by",
  "Prod.": "Prod.",
  "Ass. de produção": "Production assistant",
  "Assist. produção": "Production assistant",
  "Ass. de set": "Set assistant",
  "Pós-produção": "Post-production",
  "Fotografia": "Photography",
  "Fotografia still": "Still photography",
  "Foto": "Photo",
  "Foto still": "Still photo",
  "Assistente": "Assistant",
  "Assist.": "Assist.",
  "Assist. styling": "Styling assistant",
  "Modelos": "Models",
  "Produção de elenco": "Casting",
  "Foco": "Focus puller",
  "Roteirista": "Screenwriter",
  "Roteiro": "Script",
  "Narração": "Narration",
  "Figurantes": "Extras",
  "Dançarino": "Dancer",
  "Locação": "Location",
  "Gravação": "Recording",
  "Captação": "Capture",
  "Panfletos": "Flyers",
  "Vídeo": "Video",
  "Trilha": "Soundtrack",
  "Trilha sonora": "Soundtrack",
  "Agradecimentos": "Thanks",
  "Desenvolvido por": "Developed by",
  "Motocas": "Bikers",
  "Música": "Music",
  "Artista": "Artist",
  "Decupagem e montagem": "Logging and editing",
  "Composição": "Composition",
  "Mixagem e masterização": "Mixing and mastering",
};

export function creditLabel(label: string, locale: Locale) {
  return locale === "en" ? (CREDIT_LABELS_EN[label] ?? label) : label;
}

/** "Gons e Quadros" → "Gons & Quadros" on the English pages. */
export function creditValue(value: string, locale: Locale) {
  return locale === "en" ? value.replace(/ e /g, " & ") : value;
}
