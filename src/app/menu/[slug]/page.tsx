import { notFound } from "next/navigation";
import { MenuView } from "@/components/menu/MenuView";
import { mockRestaurant, mockCategories, mockDishes } from "@/lib/mock-data";
import { getRestaurantBySlug, getCategoriesForRestaurant, getDishesForRestaurant } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

// Always fetch fresh — menu must reflect admin changes immediately
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getMenuData(slug: string) {
  if (isSupabaseConfigured()) {
    try {
      const restaurant = await getRestaurantBySlug(slug);
      if (restaurant) {
        const [categories, dishes] = await Promise.all([
          getCategoriesForRestaurant(restaurant.id),
          getDishesForRestaurant(restaurant.id),
        ]);
        return { restaurant, categories, dishes };
      }
    } catch (e) {
      console.error("Supabase fetch failed, falling back to mock:", e);
    }
  }

  if (slug === mockRestaurant.slug) {
    return { restaurant: mockRestaurant, categories: mockCategories, dishes: mockDishes };
  }
  return null;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getMenuData(slug);
  if (!data) return { title: "Menu não encontrado" };
  return {
    title: `${data.restaurant.name} — Menu`,
    description: data.restaurant.description,
  };
}

export default async function MenuPage({ params }: Props) {
  const { slug } = await params;
  const data = await getMenuData(slug);
  if (!data) notFound();

  return (
    <MenuView
      restaurant={data.restaurant}
      categories={data.categories}
      dishes={data.dishes}
    />
  );
}
