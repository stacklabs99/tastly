export type Locale = "pt" | "en" | "es" | "fr";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "pt", label: "PT", flag: "🇵🇹" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "es", label: "ES", flag: "🇪🇸" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
];

export type TKeys = {
  featured: string;
  close: string;
  soldOut: string;
  popular: string;
  tab_info: string;
  tab_ai: string;
  nutrition: string;
  calories: string;
  proteins: string;
  carbs: string;
  fat: string;
  allergens: string;
  no_info: string;
  ai_cta_idle: string;
  ai_cta_done: string;
  ai_sub_before: string;
  ai_sub_after: string;
  ai_loading: string;
  ai_analyzing: string;
  ai_sommelier: string;
  ai_wines: string;
  ai_starters: string;
  ai_desserts: string;
  ai_why: string;
  ai_regenerate: string;
  ai_credit: string;
  ai_empty_title: string;
  ai_empty_desc: string;
  ai_empty_cta: string;
};

const translations: Record<Locale, TKeys> = {
  pt: {
    featured: "Em Destaque",
    close: "Fechar",
    soldOut: "Esgotado",
    popular: "Popular",
    tab_info: "Informação",
    tab_ai: "Sugestão da Casa",
    nutrition: "Informação Nutricional",
    calories: "Calorias",
    proteins: "Proteínas",
    carbs: "Hidratos",
    fat: "Gorduras",
    allergens: "Alergénios",
    no_info: "Informação nutricional não disponível.",
    ai_cta_idle: "Sugestão da Casa",
    ai_cta_done: "Ver sugestões",
    ai_sub_before: "Maridagem · Vinhos · Entradas · Sobremesas",
    ai_sub_after: "Vinho · Entrada · Sobremesa sugeridos",
    ai_loading: "A preparar sugestões...",
    ai_analyzing: "A analisar o perfil de sabores do prato...",
    ai_sommelier: "Nota do chef",
    ai_wines: "Vinhos Sugeridos",
    ai_starters: "Entradas a Combinar",
    ai_desserts: "Sobremesas Ideais",
    ai_why: "Porquê:",
    ai_regenerate: "Atualizar sugestões",
    ai_credit: "✦ Sugestão da Casa",
    ai_empty_title: "Sugestão da Casa",
    ai_empty_desc: "O nosso chef sugere o vinho, entrada e sobremesa ideais para acompanhar este prato.",
    ai_empty_cta: "Ver sugestões",
  },
  en: {
    featured: "Featured",
    close: "Close",
    soldOut: "Sold out",
    popular: "Popular",
    tab_info: "Information",
    tab_ai: "House Suggestion",
    nutrition: "Nutritional Info",
    calories: "Calories",
    proteins: "Proteins",
    carbs: "Carbs",
    fat: "Fat",
    allergens: "Allergens",
    no_info: "Nutritional information not available.",
    ai_cta_idle: "House Suggestion",
    ai_cta_done: "View suggestions",
    ai_sub_before: "Pairing · Wines · Starters · Desserts",
    ai_sub_after: "Wine · Starter · Dessert suggested",
    ai_loading: "Preparing suggestions...",
    ai_analyzing: "Analysing the flavour profile...",
    ai_sommelier: "Chef's note",
    ai_wines: "Suggested Wines",
    ai_starters: "Starters to Pair",
    ai_desserts: "Ideal Desserts",
    ai_why: "Why:",
    ai_regenerate: "Refresh suggestions",
    ai_credit: "✦ House Suggestion",
    ai_empty_title: "House Suggestion",
    ai_empty_desc: "Our chef suggests the ideal wine, starter and dessert to pair with this dish.",
    ai_empty_cta: "See suggestions",
  },
  es: {
    featured: "Destacados",
    close: "Cerrar",
    soldOut: "Agotado",
    popular: "Popular",
    tab_info: "Información",
    tab_ai: "Sugerencia de la Casa",
    nutrition: "Información Nutricional",
    calories: "Calorías",
    proteins: "Proteínas",
    carbs: "Hidratos",
    fat: "Grasas",
    allergens: "Alérgenos",
    no_info: "Información nutricional no disponible.",
    ai_cta_idle: "Sugerencia de la Casa",
    ai_cta_done: "Ver sugerencias",
    ai_sub_before: "Maridaje · Vinos · Entrantes · Postres",
    ai_sub_after: "Vino · Entrante · Postre sugeridos",
    ai_loading: "Preparando sugerencias...",
    ai_analyzing: "Analizando el perfil de sabores...",
    ai_sommelier: "Nota del chef",
    ai_wines: "Vinos Sugeridos",
    ai_starters: "Entrantes a Combinar",
    ai_desserts: "Postres Ideales",
    ai_why: "Por qué:",
    ai_regenerate: "Actualizar sugerencias",
    ai_credit: "✦ Sugerencia de la Casa",
    ai_empty_title: "Sugerencia de la Casa",
    ai_empty_desc: "Nuestro chef sugiere el vino, entrante y postre ideales para acompañar este plato.",
    ai_empty_cta: "Ver sugerencias",
  },
  fr: {
    featured: "En Vedette",
    close: "Fermer",
    soldOut: "Épuisé",
    popular: "Populaire",
    tab_info: "Information",
    tab_ai: "Suggestion Maison",
    nutrition: "Informations Nutritionnelles",
    calories: "Calories",
    proteins: "Protéines",
    carbs: "Glucides",
    fat: "Lipides",
    allergens: "Allergènes",
    no_info: "Informations nutritionnelles non disponibles.",
    ai_cta_idle: "Suggestion Maison",
    ai_cta_done: "Voir les suggestions",
    ai_sub_before: "Accord · Vins · Entrées · Desserts",
    ai_sub_after: "Vin · Entrée · Dessert suggérés",
    ai_loading: "Préparation des suggestions...",
    ai_analyzing: "Analyse du profil de saveurs...",
    ai_sommelier: "Note du chef",
    ai_wines: "Vins Suggérés",
    ai_starters: "Entrées à Associer",
    ai_desserts: "Desserts Idéaux",
    ai_why: "Pourquoi :",
    ai_regenerate: "Actualiser les suggestions",
    ai_credit: "✦ Suggestion Maison",
    ai_empty_title: "Suggestion Maison",
    ai_empty_desc: "Notre chef suggère le vin, l'entrée et le dessert idéaux pour accompagner ce plat.",
    ai_empty_cta: "Voir les suggestions",
  },
};

export function t(locale: Locale, key: keyof TKeys): string {
  return translations[locale][key];
}
