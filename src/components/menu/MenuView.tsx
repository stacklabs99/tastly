"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import type { Restaurant, Category, Dish } from "@/types";
import { MenuHeader } from "./MenuHeader";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { CategoryTabs } from "./CategoryTabs";
import { DishCard } from "./DishCard";
import { DishDetailSheet } from "./DishDetailSheet";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { getLocalized } from "@/lib/i18n";

type Props = {
  restaurant: Restaurant;
  categories: Category[];
  dishes: Dish[];
};

export function MenuView({ restaurant, categories, dishes }: Props) {
  const [activeCat, setActiveCat] = useState(categories[0]?.id ?? "");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [search, setSearch] = useState("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const isClickScrolling = useRef(false);

  const categoriesWithDishes = categories.filter((cat) =>
    dishes.some((d) => d.category_id === cat.id && d.is_available)
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    categoriesWithDishes.forEach((cat) => {
      const el = sectionRefs.current[cat.id];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isClickScrolling.current) setActiveCat(cat.id);
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
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => { isClickScrolling.current = false; }, 900);
  };

  const q = search.trim().toLowerCase();
  const searchResults = q.length > 1
    ? dishes.filter((d) => d.is_available && (
        d.name.toLowerCase().includes(q) ||
        (d.description ?? "").toLowerCase().includes(q)
      ))
    : null;

  const accent = restaurant.primary_color ?? "#e6a81e";

  return (
    <LanguageProvider>
      <div className="min-h-screen" style={{ background: "#1a1916", "--accent": accent } as React.CSSProperties}>
        <MenuHeader restaurant={restaurant} />
        <FeaturedCarousel dishes={dishes} onSelect={setSelectedDish} />
        <CategoryTabs
          categories={categoriesWithDishes}
          activeId={activeCat}
          onChange={handleCategoryChange}
        />

        {/* Search bar */}
        <div className="px-3 sm:px-4 pt-3 pb-1 max-w-5xl mx-auto">
          <div
            className="flex items-center gap-2 px-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#626250" }} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar pratos..."
              className="flex-1 bg-transparent py-2.5 text-sm outline-none"
              style={{ color: "#f0efe9" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="flex-shrink-0 p-0.5">
                <X className="w-3.5 h-3.5" style={{ color: "#626250" }} />
              </button>
            )}
          </div>
        </div>

        <main className="px-3 sm:px-4 pb-28 max-w-5xl mx-auto">
          {searchResults ? (
            /* Search results */
            <section className="pt-5">
              <p className="text-xs mb-4 px-1" style={{ color: "#626250" }}>
                {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""} para &ldquo;{search.trim()}&rdquo;
              </p>
              {searchResults.length === 0 ? (
                <div className="text-center py-16" style={{ color: "#504e41" }}>
                  <div className="text-4xl mb-3 opacity-30">🍽️</div>
                  <p className="text-sm">Nenhum prato encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {searchResults.map((dish, idx) => (
                    <DishCard key={dish.id} dish={dish} onClick={setSelectedDish} delay={idx * 30} />
                  ))}
                </div>
              )}
            </section>
          ) : (
            /* Normal category view */
            categoriesWithDishes.map((cat, catIdx) => {
              const catDishes = dishes.filter((d) => d.category_id === cat.id && d.is_available);
              if (catDishes.length === 0) return null;

              return (
                <section
                  key={cat.id}
                  ref={(el) => { sectionRefs.current[cat.id] = el; }}
                  className="pt-8"
                >
                  {catIdx > 0 && (
                    <div className="mb-6" style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
                  )}

                  <div className="mb-4 flex items-baseline justify-between px-1">
                    <CategoryHeader cat={cat} />
                    <span className="text-xs font-medium ml-3 flex-shrink-0" style={{ color: "#504e41" }}>
                      <DishCount n={catDishes.length} />
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {catDishes.map((dish, idx) => (
                      <DishCard key={dish.id} dish={dish} onClick={setSelectedDish} delay={idx * 40} />
                    ))}
                  </div>
                </section>
              );
            })
          )}

          {!searchResults && restaurant.review_url && <ReviewSection reviewUrl={restaurant.review_url} />}
          <TastlyFooter />
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

function CategoryHeader({ cat }: { cat: Category }) {
  const { locale } = useLanguage();
  const name = getLocalized(cat, locale, "name");
  const description = getLocalized(cat, locale, "description");
  return (
    <div>
      <h2 className="font-serif font-semibold" style={{ color: "#f5f5f0", fontSize: 20 }}>
        {name}
      </h2>
      {description && (
        <p className="text-xs mt-0.5" style={{ color: "#626250" }}>
          {description}
        </p>
      )}
    </div>
  );
}

function DishCount({ n }: { n: number }) {
  const { tr } = useLanguage();
  return <>{n} {n === 1 ? tr("dish_one") : tr("dish_many")}</>;
}

function ReviewSection({ reviewUrl }: { reviewUrl: string }) {
  const { tr } = useLanguage();
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&bgcolor=1a1916&color=e6a81e&data=${encodeURIComponent(reviewUrl)}`;

  return (
    <div className="mt-14 mb-2">
      <div
        className="rounded-3xl p-6"
        style={{
          background: "linear-gradient(135deg, rgba(230,168,30,0.09) 0%, rgba(230,168,30,0.03) 100%)",
          border: "1px solid rgba(230,168,30,0.2)",
        }}
      >
        <div className="flex justify-center gap-0.5 mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} style={{ fontSize: 20, color: "#e6a81e" }}>★</span>
          ))}
        </div>
        <h3 className="font-serif font-semibold text-center mb-1" style={{ color: "#f0efe9", fontSize: 17 }}>
          {tr("review_title")}
        </h3>
        <p className="text-center text-sm mb-5 leading-relaxed" style={{ color: "#6e6c5a" }}>
          {tr("review_sub")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold active:scale-95 transition-transform"
            style={{ background: "#e6a81e", color: "#1a1916" }}
          >
            ★ {tr("review_cta")}
          </a>
          <div className="flex flex-col items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR Code" width={80} height={80} className="rounded-xl" style={{ opacity: 0.85 }} />
            <p style={{ color: "#4a4a3a", fontSize: 10 }}>{tr("review_scan")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TastlyFooter() {
  const { tr } = useLanguage();
  return (
    <div className="mt-10 pb-2 text-center">
      <div className="inline-flex items-center gap-2 text-xs" style={{ color: "#3a3830" }}>
        <span>{tr("footer_by")}</span>
        <span className="font-semibold" style={{ color: "#626250" }}>Tastly</span>
      </div>
    </div>
  );
}
