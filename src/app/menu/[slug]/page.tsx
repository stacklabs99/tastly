import { notFound } from "next/navigation";
import { MenuView } from "@/components/menu/MenuView";
import { getRestaurantBySlug, getCategoriesForRestaurant, getDishesForRestaurant } from "@/lib/db";

// Always fetch fresh — menu must reflect admin changes immediately
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getMenuData(slug: string) {
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || !restaurant.is_active) return null;
  const [categories, dishes] = await Promise.all([
    getCategoriesForRestaurant(restaurant.id),
    getDishesForRestaurant(restaurant.id),
  ]);
  return { restaurant, categories, dishes };
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getMenuData(slug);
  if (!data) return { title: "Menu não encontrado" };
  const { restaurant } = data;
  return {
    title: `${restaurant.name} — Menu`,
    description: restaurant.description ?? `Menu digital de ${restaurant.name}`,
    openGraph: {
      title: `${restaurant.name} — Menu Digital`,
      description: restaurant.description ?? `Consulte o menu completo de ${restaurant.name}`,
      type: "website",
      ...(restaurant.cover_url && {
        images: [{ url: restaurant.cover_url, width: 1200, height: 630, alt: restaurant.name }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${restaurant.name} — Menu`,
      ...(restaurant.cover_url && { images: [restaurant.cover_url] }),
    },
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
