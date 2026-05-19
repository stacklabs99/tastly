export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type RestaurantRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  address: string | null;
  phone: string | null;
  cuisine_type: string | null;
  primary_color: string | null;
  owner_id: string;
  is_active: boolean;
  created_at: string;
};

type CategoryRow = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  position: number;
  created_at: string;
};

type DishRow = {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  allergens: string[];
  calories: number | null;
  proteins: number | null;
  carbs: number | null;
  fat: number | null;
  is_available: boolean;
  is_featured: boolean;
  tags: string[];
  position: number;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: RestaurantRow;
        Insert: Partial<RestaurantRow> & { slug: string; name: string; owner_id: string };
        Update: Partial<RestaurantRow>;
      };
      categories: {
        Row: CategoryRow;
        Insert: Partial<CategoryRow> & { restaurant_id: string; name: string; position: number };
        Update: Partial<CategoryRow>;
      };
      dishes: {
        Row: DishRow;
        Insert: Partial<DishRow> & { restaurant_id: string; category_id: string; name: string; description: string; price: number };
        Update: Partial<DishRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
