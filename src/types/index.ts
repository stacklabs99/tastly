export type LocaleTranslation = { name?: string; description?: string };

export type Category = {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  position: number;
  created_at: string;
  translations?: Record<string, LocaleTranslation>;
};

export type Allergen =
  | "gluten"
  | "crustaceos"
  | "ovos"
  | "peixe"
  | "amendoins"
  | "soja"
  | "leite"
  | "frutos_casca"
  | "aipo"
  | "mostarda"
  | "sesamo"
  | "sulfitos"
  | "tremocos"
  | "moluscos";

export type Dish = {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  allergens: Allergen[];
  calories?: number;
  proteins?: number;
  carbs?: number;
  fat?: number;
  is_available: boolean;
  is_featured: boolean;
  is_special: boolean;
  tags: string[];
  position: number;
  manual_pairings?: ManualPairings;
  translations?: Record<string, LocaleTranslation>;
  created_at: string;
  updated_at: string;
};

export type ManualPairings = {
  wines: RecommendationItem[];
  starters: RecommendationItem[];
  mains: RecommendationItem[];
  desserts: RecommendationItem[];
};

export type Plan = "starter" | "pro" | "custom";

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  address?: string;
  phone?: string;
  cuisine_type?: string;
  primary_color?: string;
  review_url?: string;
  owner_id: string;
  is_active: boolean;
  plan: Plan;
  trial_ends_at: string;
  trial_warning_sent_at?: string | null;
  created_at: string;
};

export type DishType = "wine" | "starter" | "main" | "dessert" | "beverage" | "other";

export type AIRecommendation = {
  wines: RecommendationItem[];
  starters: RecommendationItem[];
  mains: RecommendationItem[];
  desserts: RecommendationItem[];
  reasoning: string;
};

export type RecommendationItem = {
  name: string;
  description: string;
  why: string;
  dish_id?: string;
};

export type AllergenInfo = {
  id: Allergen;
  label: string;
  icon: string;
};

export const ALLERGEN_INFO: Record<Allergen, AllergenInfo> = {
  gluten: { id: "gluten", label: "Glúten", icon: "🌾" },
  crustaceos: { id: "crustaceos", label: "Crustáceos", icon: "🦐" },
  ovos: { id: "ovos", label: "Ovos", icon: "🥚" },
  peixe: { id: "peixe", label: "Peixe", icon: "🐟" },
  amendoins: { id: "amendoins", label: "Amendoins", icon: "🥜" },
  soja: { id: "soja", label: "Soja", icon: "🫘" },
  leite: { id: "leite", label: "Leite", icon: "🥛" },
  frutos_casca: { id: "frutos_casca", label: "Frutos de Casca", icon: "🌰" },
  aipo: { id: "aipo", label: "Aipo", icon: "🌿" },
  mostarda: { id: "mostarda", label: "Mostarda", icon: "🌻" },
  sesamo: { id: "sesamo", label: "Sésamo", icon: "⚫" },
  sulfitos: { id: "sulfitos", label: "Sulfitos", icon: "🧪" },
  tremocos: { id: "tremocos", label: "Tremoços", icon: "🫘" },
  moluscos: { id: "moluscos", label: "Moluscos", icon: "🐚" },
};
