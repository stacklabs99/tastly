import { z } from "zod";

const ALLERGENS = [
  "gluten", "crustaceos", "ovos", "peixe", "amendoins", "soja",
  "leite", "frutos_casca", "aipo", "mostarda", "sesamo", "sulfitos",
  "tremocos", "moluscos",
] as const;

const httpsUrl = z
  .string()
  .url()
  .startsWith("https://", { message: "URL deve começar com https://" })
  .max(500);

// ── Dish ──────────────────────────────────────────────────────────────────────

export const DishSchema = z.object({
  restaurant_id: z.string().uuid(),
  category_id: z.string().uuid(),
  name: z.string().min(1, "Nome obrigatório").max(100, "Nome demasiado longo"),
  description: z.string().min(1, "Descrição obrigatória").max(600, "Descrição demasiado longa"),
  price: z.number().min(0.01, "Preço deve ser positivo").max(9999, "Preço demasiado elevado"),
  image_url: httpsUrl.nullable().optional(),
  allergens: z.array(z.enum(ALLERGENS)).max(14),
  calories: z.number().int().min(0).max(9999).nullable().optional(),
  proteins: z.number().min(0).max(999).nullable().optional(),
  carbs: z.number().min(0).max(999).nullable().optional(),
  fat: z.number().min(0).max(999).nullable().optional(),
  is_available: z.boolean(),
  is_featured: z.boolean(),
  tags: z.array(z.string().max(50)).max(10),
  position: z.number().int().min(0).max(9999),
  manual_pairings: z.any().optional(),
  translations: z.any().optional(),
});

export const DishUpdateSchema = DishSchema.partial().omit({ restaurant_id: true });

// ── Category ──────────────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  restaurant_id: z.string().uuid(),
  name: z.string().min(1, "Nome obrigatório").max(100, "Nome demasiado longo"),
  description: z.string().max(300, "Descrição demasiado longa").optional(),
  position: z.number().int().min(0).max(9999),
});

export const CategoryUpdateSchema = CategorySchema.partial().omit({ restaurant_id: true });

// ── Restaurant ────────────────────────────────────────────────────────────────

export const RestaurantUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  logo_url: httpsUrl.nullable().optional(),
  cover_url: httpsUrl.nullable().optional(),
  address: z.string().max(200).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  cuisine_type: z.string().max(100).nullable().optional(),
  primary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida (ex: #e6a81e)")
    .nullable()
    .optional(),
  review_url: httpsUrl.nullable().optional(),
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug apenas pode conter letras minúsculas, números e hífens")
    .optional(),
});
