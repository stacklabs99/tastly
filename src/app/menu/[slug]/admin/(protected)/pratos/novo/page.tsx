"use client";

import { useRouter, useParams } from "next/navigation";
import { useAdmin } from "@/contexts/AdminContext";
import { DishForm } from "@/components/admin/DishForm";

export default function NovoPratoPage() {
  const { categories, dishes, restaurant, addDish, loading } = useAdmin();
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-5xl">
          <div className="h-8 w-36 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="h-64 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)" }} />
          <div className="h-40 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <DishForm
        categories={categories}
        dishes={dishes}
        slug={slug}
        isNew
        onSave={(data) => {
          addDish({ ...data, restaurant_id: restaurant.id });
          router.push(`/menu/${slug}/admin/pratos`);
        }}
      />
    </div>
  );
}
