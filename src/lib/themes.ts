// Visual themes for the public menu. Each preset only changes typography
// (heading + body font), using fonts already loaded (Playfair, Inter) plus
// reliable system fonts — no extra dependencies or web-font loading.

export type ThemeId = "elegante" | "moderno" | "classico" | "descontraido";

export type ThemePreset = {
  id: ThemeId;
  label: string;
  description: string;
  heading: string;
  body: string;
  // A short sample to preview the font feel in the picker
  sampleStyle: React.CSSProperties;
};

export const THEMES: ThemePreset[] = [
  {
    id: "elegante",
    label: "Elegante",
    description: "Serifa refinada — fine dining",
    heading: "var(--font-playfair), Georgia, serif",
    body: "var(--font-inter), system-ui, sans-serif",
    sampleStyle: { fontFamily: "var(--font-playfair), Georgia, serif" },
  },
  {
    id: "moderno",
    label: "Moderno",
    description: "Sem serifa, limpo e atual",
    heading: "var(--font-inter), system-ui, sans-serif",
    body: "var(--font-inter), system-ui, sans-serif",
    sampleStyle: { fontFamily: "var(--font-inter), system-ui, sans-serif", fontWeight: 700, letterSpacing: "-0.02em" },
  },
  {
    id: "classico",
    label: "Clássico",
    description: "Serifa tradicional e calorosa",
    heading: "Georgia, 'Times New Roman', serif",
    body: "Georgia, 'Times New Roman', serif",
    sampleStyle: { fontFamily: "Georgia, 'Times New Roman', serif" },
  },
  {
    id: "descontraido",
    label: "Descontraído",
    description: "Amigável — cafés e brunch",
    heading: "'Trebuchet MS', 'Segoe UI', system-ui, sans-serif",
    body: "'Trebuchet MS', 'Segoe UI', system-ui, sans-serif",
    sampleStyle: { fontFamily: "'Trebuchet MS', 'Segoe UI', system-ui, sans-serif", fontWeight: 600 },
  },
];

const DEFAULT: ThemePreset = THEMES[0];

export function getTheme(id: string | null | undefined): ThemePreset {
  return THEMES.find((t) => t.id === id) ?? DEFAULT;
}
