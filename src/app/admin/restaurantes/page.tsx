import { listAllRestaurants } from "@/actions/superadmin";
import { RestaurantTableClient } from "./RestaurantTableClient";

export const dynamic = "force-dynamic";

export default async function RestaurantesPage() {
  const restaurants = await listAllRestaurants();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold" style={{ color: "#f5f5f0" }}>Restaurantes</h1>
        <p className="text-sm mt-1" style={{ color: "#626250" }}>
          {restaurants.length} restaurante{restaurants.length !== 1 ? "s" : ""} na plataforma
        </p>
      </div>

      <RestaurantTableClient restaurants={restaurants} />
    </div>
  );
}
