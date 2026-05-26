import type { TKeys } from "@/lib/i18n";

// Dietary filters map to tags already stored on dishes. `match` lists the
// accepted normalized tag variants (accents stripped, spaces → hyphens).
export const DIET_FILTERS: { id: string; key: keyof TKeys; match: string[] }[] = [
  { id: "vegetariano", key: "tag_vegetariano", match: ["vegetariano", "vegetariana"] },
  { id: "vegan", key: "tag_vegan", match: ["vegan", "vegano", "vegana"] },
  { id: "gluten", key: "tag_sem_gluten", match: ["sem-gluten"] },
  { id: "lactose", key: "tag_sem_lactose", match: ["sem-lactose"] },
];

export function normTag(s: string): string {
  return s.toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
}

export function tagsMatchDiet(tags: string[], filterId: string): boolean {
  const filter = DIET_FILTERS.find((f) => f.id === filterId);
  if (!filter) return false;
  const normalized = tags.map(normTag);
  return normalized.some((t) => filter.match.includes(t));
}

// True if the tags satisfy ALL active dietary filters (AND logic).
export function passesDiet(tags: string[], activeIds: Iterable<string>): boolean {
  for (const id of activeIds) {
    if (!tagsMatchDiet(tags, id)) return false;
  }
  return true;
}
