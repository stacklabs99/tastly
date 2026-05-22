import { notFound } from "next/navigation";
import { getRestaurantDetailAdmin } from "@/actions/superadmin";
import { RestaurantDetailClient } from "./RestaurantDetailClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function RestaurantDetailPage({ params }: Props) {
  const { id } = await params;
  const restaurant = await getRestaurantDetailAdmin(id);
  if (!restaurant) notFound();

  return <RestaurantDetailClient restaurant={restaurant} />;
}
