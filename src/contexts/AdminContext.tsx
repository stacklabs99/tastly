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
import { showToast } from "@/lib/toast";

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
    plan: "starter",
    trial_ends_at: new Date(Date.now() + 15 * 864e5).toISOString(),
    theme: "elegante",
    created_at: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [restaurantId, setRestaurantId] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const rest = await fetchRestaurantBySlug(slug);
        if (rest) {
          setRestaurant(rest);
          setRestaurantId(rest.id);
          const [cats, dishs] = await Promise.all([
            fetchCategories(rest.id),
            fetchDishes(rest.id),
          ]);
          setCategories(cats);
          setDishes(dishs);
        }
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  // ── Refetch helpers ──────────────────────────────────────────────────────────

  const refetchDishes = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const dishs = await fetchDishes(restaurantId);
      setDishes(dishs);
    } catch { /* silent — state already rolled back */ }
  }, [restaurantId]);

  const refetchCategories = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const cats = await fetchCategories(restaurantId);
      setCategories(cats);
    } catch { /* silent */ }
  }, [restaurantId]);

  // ── Dishes ───────────────────────────────────────────────────────────────────

  const addDish = useCallback(async (dish: Omit<Dish, "id" | "created_at" | "updated_at">) => {
    const now = new Date().toISOString();
    const tempId = `tmp-${Math.random().toString(36).slice(2, 8)}`;
    const optimistic: Dish = { ...dish, id: tempId, created_at: now, updated_at: now };
    setDishes((prev) => [...prev, optimistic]);
    try {
      const newDish = await addDishAction(dish, slug);
      setDishes((prev) => prev.map((d) => d.id === tempId ? newDish : d));
      showToast("Prato criado com sucesso", "success");
      return newDish;
    } catch (err) {
      setDishes((prev) => prev.filter((d) => d.id !== tempId));
      showToast("Erro ao criar prato", "error");
      throw err;
    }
  }, [slug]);

  const updateDish = useCallback(async (id: string, updates: Partial<Dish>) => {
    let snapshot: Dish | undefined;
    setDishes((prev) => {
      snapshot = prev.find((d) => d.id === id);
      return prev.map((d) => d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d);
    });
    try {
      await updateDishAction(id, updates, slug);
    } catch {
      if (snapshot) setDishes((prev) => prev.map((d) => d.id === id ? snapshot! : d));
      else await refetchDishes();
      showToast("Erro ao guardar alterações", "error");
    }
  }, [slug, refetchDishes]);

  const deleteDish = useCallback(async (id: string) => {
    let snapshot: Dish | undefined;
    setDishes((prev) => {
      snapshot = prev.find((d) => d.id === id);
      return prev.filter((d) => d.id !== id);
    });
    try {
      await deleteDishAction(id, slug);
      showToast("Prato eliminado", "info");
    } catch {
      if (snapshot) setDishes((prev) => [...prev, snapshot!]);
      showToast("Erro ao eliminar prato", "error");
    }
  }, [slug]);

  // ── Categories ───────────────────────────────────────────────────────────────

  const addCategory = useCallback(async (cat: Omit<Category, "id" | "created_at">) => {
    const tempId = `tmp-${Math.random().toString(36).slice(2, 8)}`;
    const optimistic: Category = { ...cat, id: tempId, created_at: new Date().toISOString() };
    setCategories((prev) => [...prev, optimistic]);
    try {
      const newCat = await addCategoryAction(cat, slug);
      setCategories((prev) => prev.map((c) => c.id === tempId ? newCat : c));
      showToast("Categoria criada", "success");
      return newCat;
    } catch (err) {
      setCategories((prev) => prev.filter((c) => c.id !== tempId));
      showToast("Erro ao criar categoria", "error");
      throw err;
    }
  }, [slug]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    let snapshot: Category | undefined;
    setCategories((prev) => {
      snapshot = prev.find((c) => c.id === id);
      return prev.map((c) => c.id === id ? { ...c, ...updates } : c);
    });
    try {
      await updateCategoryAction(id, updates, slug);
      showToast("Categoria actualizada", "success");
    } catch {
      if (snapshot) setCategories((prev) => prev.map((c) => c.id === id ? snapshot! : c));
      else await refetchCategories();
      showToast("Erro ao actualizar categoria", "error");
    }
  }, [slug, refetchCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    let snapshot: Category | undefined;
    setCategories((prev) => {
      snapshot = prev.find((c) => c.id === id);
      return prev.filter((c) => c.id !== id);
    });
    try {
      await deleteCategoryAction(id, slug);
      showToast("Categoria eliminada", "info");
    } catch {
      if (snapshot) setCategories((prev) => [...prev, snapshot!]);
      showToast("Erro ao eliminar categoria", "error");
    }
  }, [slug]);

  // ── Restaurant ───────────────────────────────────────────────────────────────

  const updateRestaurant = useCallback(async (updates: Partial<Restaurant>) => {
    const snapshot = restaurant;
    setRestaurant((prev) => ({ ...prev, ...updates }));
    try {
      await updateRestaurantAction(restaurant.id, updates, slug);
      showToast("Restaurante actualizado", "success");
    } catch {
      setRestaurant(snapshot);
      showToast("Erro ao guardar restaurante", "error");
    }
  }, [slug, restaurant]);

  return (
    <AdminContext.Provider value={{
      dishes, categories, restaurant, loading, loadError,
      addDish, updateDish, deleteDish,
      addCategory, updateCategory, deleteCategory,
      updateRestaurant,
    }}>
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
