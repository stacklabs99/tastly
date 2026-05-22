"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dish } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateTag, getLocalized } from "@/lib/i18n";

type Props = {
  dishes: Dish[];
  onSelect: (dish: Dish) => void;
};

export function FeaturedCarousel({ dishes, onSelect }: Props) {
  const { tr } = useLanguage();
  const featured = dishes
    .filter((d) => d.is_featured && d.is_available)
    .slice(0, 4);
  const [activeIdx, setActiveIdx] = useState(0);

  if (featured.length === 0) return null;

  return (
    <div className="pt-5 pb-3">
      {/* Título */}
      <div className="px-5 mb-3 flex items-center gap-2.5">
        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#626250" }}>
          {tr("chefs_pick")}
        </span>
        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>

      {/* Scroll horizontal */}
      <div
        className="flex gap-3 px-5 overflow-x-auto pb-0.5"
        style={{
          scrollbarWidth: "none",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
        onScroll={(e) => {
          const el = e.currentTarget;
          const cardW = 0.76 * 390 + 12; // aprox largura de 1 card + gap
          setActiveIdx(Math.min(Math.round(el.scrollLeft / cardW), featured.length - 1));
        }}
      >
        {featured.map((dish) => (
          <FeaturedCard key={dish.id} dish={dish} onSelect={onSelect} />
        ))}
        <div className="flex-shrink-0 w-3" aria-hidden />
      </div>

      {/* Dots — só quando há mais de 1 */}
      {featured.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {featured.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === activeIdx ? 18 : 5,
                height: 5,
                background: i === activeIdx ? "var(--accent, #e6a81e)" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedCard({ dish, onSelect }: { dish: Dish; onSelect: (d: Dish) => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { tr, locale } = useLanguage();
  const dishName = getLocalized(dish, locale, "name");
  const dishDescription = getLocalized(dish, locale, "description");

  return (
    <button
      onClick={() => onSelect(dish)}
      className="relative flex-shrink-0 rounded-2xl overflow-hidden active:scale-[0.97] transition-transform"
      style={{
        width: "76vw",
        maxWidth: 320,
        height: 210,
        scrollSnapAlign: "start",
      }}
    >
      {!imgLoaded && <div className="absolute inset-0 skeleton" />}

      {dish.image_url && !imgError && (
        <Image
          src={dish.image_url}
          alt={dishName}
          fill
          className="object-cover transition-opacity duration-600"
          style={{ opacity: imgLoaded ? 1 : 0 }}
          sizes="320px"
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgError(true); setImgLoaded(true); }}
        />
      )}

      {/* Gradiente forte no fundo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(14,13,11,0.15) 0%, rgba(14,13,11,0.3) 40%, rgba(14,13,11,0.92) 100%)",
        }}
      />

      {/* Preço top-right */}
      <div className="absolute top-3 right-3">
        <span
          className="text-sm font-bold px-2.5 py-1 rounded-xl"
          style={{ background: "rgba(26,25,22,0.72)", backdropFilter: "blur(8px)", color: "var(--accent, #e6a81e)" }}
        >
          {dish.price.toFixed(2)} €
        </span>
      </div>

      {/* Categoria top-left */}
      {dish.category_id && dish.tags[0] && (
        <div className="absolute top-3 left-3">
          <span
            className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(26,25,22,0.65)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#b8b8a8",
            }}
          >
            {translateTag(dish.tags[0], tr)}
          </span>
        </div>
      )}

      {/* Nome + descrição */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-serif text-white font-semibold leading-tight" style={{ fontSize: 18 }}>
          {dishName}
        </h3>
        <p className="mt-1 line-clamp-2 leading-snug" style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
          {dishDescription}
        </p>
      </div>
    </button>
  );
}
