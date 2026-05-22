"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dish } from "@/types";
import { useInView } from "@/hooks/useInView";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalized } from "@/lib/i18n";

type Props = {
  dish: Dish;
  onClick: (dish: Dish) => void;
  delay?: number;
};

export function DishCard({ dish, onClick, delay = 0 }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [ref, inView] = useInView(0.06);
  const { tr, locale } = useLanguage();
  const showPopular = dish.tags.includes("popular");
  const dishName = getLocalized(dish, locale, "name");
  const dishDescription = getLocalized(dish, locale, "description");

  return (
    <button
      // @ts-expect-error ref type
      ref={ref}
      onClick={() => onClick(dish)}
      className={`group w-full text-left rounded-2xl overflow-hidden transition-transform duration-200 active:scale-[0.96] card-hidden ${
        inView ? "card-visible" : ""
      }`}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        animationDelay: inView ? `${delay}ms` : "0ms",
      }}
    >
      {/* mobile: vertical · lg: horizontal */}
      <div className="flex flex-col lg:flex-row">

        {/* Image */}
        <div
          className="relative overflow-hidden flex-shrink-0 lg:w-[120px] lg:self-stretch"
          style={{ aspectRatio: "4/3", background: "#1e1d1a" }}
        >
          {!imgLoaded && <div className="absolute inset-0 skeleton" />}

          {dish.image_url && !imgError ? (
            <Image
              src={dish.image_url}
              alt={dishName}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-[1.06]"
              style={{ opacity: imgLoaded ? 1 : 0 }}
              sizes="(max-width: 1024px) 50vw, 200px"
              onLoad={() => setImgLoaded(true)}
              onError={() => { setImgError(true); setImgLoaded(true); }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl" style={{ opacity: 0.2 }}>
              🍽️
            </div>
          )}

          {showPopular && (
            <div
              className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
              style={{ background: "var(--accent, #e6a81e)", color: "#1a1916" }}
            >
              ✦ {tr("popular")}
            </div>
          )}

          {!dish.is_available && (
            <div
              className="absolute inset-0 flex items-center justify-center text-sm font-medium"
              style={{ background: "rgba(26,25,22,0.78)", color: "#626250" }}
            >
              {tr("soldOut")}
            </div>
          )}

          {/* Bottom gradient — mobile only */}
          <div
            className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none lg:hidden"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(26,25,22,0.45))" }}
          />
        </div>

        {/* Content */}
        <div className="p-2.5 lg:flex-1 lg:flex lg:flex-col lg:justify-between">
          <div>
            <h3
              className="font-serif font-semibold leading-tight line-clamp-2 mb-1"
              style={{ color: "#f0efe9", fontSize: 12 }}
            >
              {dishName}
            </h3>
            <p
              className="leading-snug line-clamp-2 mb-2 hidden sm:block"
              style={{ color: "#6e6c5a", fontSize: 11 }}
            >
              {dishDescription}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold" style={{ color: "var(--accent, #e6a81e)", fontSize: 13 }}>
              {dish.price.toFixed(2)} €
            </span>
            {dish.calories != null && dish.calories > 0 && (
              <span className="hidden sm:inline" style={{ color: "#484640", fontSize: 10 }}>
                {dish.calories} kcal
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
