"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Dish, Category, Restaurant, Allergen } from "@/types";
import {
  fetchRestaurantBySlug,
  fetchCategories,
  fetchDishes,
  addDishAction,
  updateDishAction,
  deleteDishAction,
  addCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  updateRestaurantAction,
} from "@/actions/admin";

type AdminContextType = {
  dishes: Dish[];
  categories: Category[];
  restaurant: Restaurant;
  loading: boolean;
  loadError: boolean;
  addDish: (dish: Omit<Dish, "id" | "created_at" | "updated_at">) => Promise<Dish>;
  updateDish: (id: string, updates: Partial<Dish>) => Promise<void>;
  deleteDish: (id: string) => Promise<void>;
  addCategory: (cat: Omit<Category, "id" | "created_at">) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateRestaurant: (updates: Partial<Restaurant>) => Promise<void>;
};

const AdminContext = createContext<AdminContextType | null>(null);

type Props = {
  children: React.ReactNode;
  slug: string;
};

export function AdminProvider({ children, slug }: Props) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant>({
    id: "",
    slug,
    name: "",
    owner_id: "",
    is_active: true,
    created_at: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [useSupabase, setUseSupabase] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const rest = await fetchRestaurantBySlug(slug);
        if (rest) {
          setRestaurant(rest);
          const [cats, dishs] = await Promise.all([
            fetchCategories(rest.id),
            fetchDishes(rest.id),
          ]);
          setCategories(cats);
          setDishes(dishs);
          setUseSupabase(true);
        }
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const addDish = useCallback(async (dish: Omit<Dish, "id" | "created_at" | "updated_at">) => {
    if (useSupabase) {
      const newDish = await addDishAction(dish, slug);
      setDishes((prev) => [...prev, newDish]);
      return newDish;
    }
    const now = new Date().toISOString();
    const newDish: Dish = { ...dish, id: `dish-${Math.random().toString(36).slice(2, 8)}`, created_at: now, updated_at: now };
    setDishes((prev) => [...prev, newDish]);
    return newDish;
  }, [useSupabase, slug]);

  const updateDish = useCallback(async (id: string, updates: Partial<Dish>) => {
    setDishes((prev) => prev.map((d) => d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d));
    if (useSupabase) {
      await updateDishAction(id, updates, slug);
    }
  }, [useSupabase, slug]);

  const deleteDish = useCallback(async (id: string) => {
    setDishes((prev) => prev.filter((d) => d.id !== id));
    if (useSupabase) {
      await deleteDishAction(id, slug);
    }
  }, [useSupabase, slug]);

  const addCategory = useCallback(async (cat: Omit<Category, "id" | "created_at">) => {
    if (useSupabase) {
      const newCat = await addCategoryAction(cat, slug);
      setCategories((prev) => [...prev, newCat]);
      return newCat;
    }
    const newCat: Category = { ...cat, id: `cat-${Math.random().toString(36).slice(2, 8)}`, created_at: new Date().toISOString() };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  }, [useSupabase, slug]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, ...updates } : c));
    if (useSupabase) {
      await updateCategoryAction(id, updates, slug);
    }
  }, [useSupabase, slug]);

  const deleteCategory = useCallback(async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (useSupabase) {
      await deleteCategoryAction(id, slug);
    }
  }, [useSupabase, slug]);

  const updateRestaurant = useCallback(async (updates: Partial<Restaurant>) => {
    setRestaurant((prev) => ({ ...prev, ...updates }));
    if (useSupabase) {
      await updateRestaurantAction(restaurant.id, updates, slug);
    }
  }, [useSupabase, slug, restaurant.id]);

  return (
    <AdminContext.Provider value={{ dishes, categories, restaurant, loading, loadError, addDish, updateDish, deleteDish, addCategory, updateCategory, deleteCategory, updateRestaurant }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}

export type { Allergen };
