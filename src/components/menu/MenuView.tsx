"use client";

import { useState, useRef, useEffect } from "react";
import type { Restaurant, Category, Dish } from "@/types";
import { MenuHeader } from "./MenuHeader";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { CategoryTabs } from "./CategoryTabs";
import { DishCard } from "./DishCard";
import { DishDetailSheet } from "./DishDetailSheet";
import { LanguageProvider } from "@/contexts/LanguageContext";

type Props = {
  restaurant: Restaurant;
  categories: Category[];
  dishes: Dish[];
};

export function MenuView({ restaurant, categories, dishes }: Props) {
  const [activeCat, setActiveCat] = useState(categories[0]?.id ?? "");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const isClickScrolling = useRef(false);

  const categoriesWithDishes = categories.filter((cat) =>
    dishes.some((d) => d.category_id === cat.id && d.is_available)
  );

  // Scroll-spy: actualiza a tab activa conforme o utilizador faz scroll
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    categoriesWithDishes.forEach((cat) => {
      const el = sectionRefs.current[cat.id];
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isClickScrolling.current) {
            setActiveCat(cat.id);
          }
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesWithDishes.length]);

  const handleCategoryChange = (catId: string) => {
    setActiveCat(catId);
    isClickScrolling.current = true;
    const el = sectionRefs.current[catId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => { isClickScrolling.current = false; }, 900);
  };

  return (
    <LanguageProvider>
    <div className="min-h-screen" style={{ background: "#1a1916" }}>
      <MenuHeader restaurant={restaurant} />

      <FeaturedCarousel
        dishes={dishes}
        onSelect={setSelectedDish}
      />

      <CategoryTabs
        categories={categoriesWithDishes}
        activeId={activeCat}
        onChange={handleCategoryChange}
      />

      <main className="px-4 pb-28">
        {categoriesWithDishes.map((cat) => {
          const catDishes = dishes.filter(
            (d) => d.category_id === cat.id && d.is_available
          );
          if (catDishes.length === 0) return null;

          return (
            <section
              key={cat.id}
              ref={(el) => { sectionRefs.current[cat.id] = el; }}
              className="pt-7"
            >
              {/* Cabeçalho da secção */}
              <div className="mb-4 flex items-baseline justify-between">
                <div>
                  <h2
                    className="font-serif font-semibold"
                    style={{ color: "#f5f5f0", fontSize: 20 }}
                  >
                    {cat.name}
                  </h2>
                  {cat.description && (
                    <p className="text-xs mt-0.5" style={{ color: "#626250" }}>
                      {cat.description}
                    </p>
                  )}
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: "#504e41" }}
                >
                  {catDishes.length} {catDishes.length === 1 ? "prato" : "pratos"}
                </span>
              </div>

              {/* Grelha 2 colunas com animação stagger */}
              <div className="grid grid-cols-2 gap-3">
                {catDishes.map((dish, idx) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    onClick={setSelectedDish}
                    delay={idx * 60}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Rodapé Tastly */}
        <div className="mt-16 pb-2 text-center">
          <div
            className="inline-flex items-center gap-2 text-xs"
            style={{ color: "#3a3830" }}
          >
            <span>Menu digital por</span>
            <span className="font-semibold" style={{ color: "#626250" }}>
              Tastly
            </span>
          </div>
        </div>
      </main>

      <DishDetailSheet
        dish={selectedDish}
        categories={categoriesWithDishes}
        onClose={() => setSelectedDish(null)}
      />
    </div>
    </LanguageProvider>
  );
}
