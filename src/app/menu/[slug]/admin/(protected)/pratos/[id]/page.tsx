"use client";

import { useParams, useRouter } from "next/navigation";
import { useAdmin } from "@/contexts/AdminContext";
import { DishForm } from "@/components/admin/DishForm";
import Link from "next/link";

export default function EditarPratoPage() {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const { dishes, categories, updateDish, deleteDish, loading } = useAdmin();
  const router = useRouter();
  const base = `/menu/${slug}/admin`;

  const dish = dishes.find((d) => d.id === id);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-5xl">
          <div className="h-8 w-48 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="h-64 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)" }} />
          <div className="h-40 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)" }} />
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#626250] mb-4">Prato não encontrado.</p>
        <Link href={`${base}/pratos`} className="text-[#e6a81e] hover:underline text-sm">← Voltar aos pratos</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <DishForm
        initial={dish}
        categories={categories}
        dishes={dishes}
        slug={slug}
        onSave={(data) => updateDish(id, { ...data })}
        onDelete={() => {
          deleteDish(id);
          router.push(`${base}/pratos`);
        }}
      />
    </div>
  );
}
