"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dish } from "@/types";
import { useInView } from "@/hooks/useInView";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  dish: Dish;
  onClick: (dish: Dish) => void;
  delay?: number;
};

export function DishCard({ dish, onClick, delay = 0 }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [ref, inView] = useInView(0.06);
  const { tr } = useLanguage();
  const showPopular = dish.tags.includes("popular");

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
      {/* Imagem */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", background: "#1e1d1a" }}>
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}

        {dish.image_url ? (
          <Image
            src={dish.image_url}
            alt={dish.name}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-[1.06]"
            style={{ opacity: imgLoaded ? 1 : 0 }}
            sizes="(max-width: 640px) 50vw, 33vw"
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl" style={{ opacity: 0.2 }}>
            🍽️
          </div>
        )}

        {/* Badge popular — só para pratos com tag "popular" */}
        {showPopular && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
            style={{ background: "#e6a81e", color: "#1a1916" }}
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

        <div
          className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(26,25,22,0.45))" }}
        />
      </div>

      {/* Conteúdo */}
      <div className="p-3">
        <h3
          className="font-serif font-semibold leading-tight line-clamp-2 mb-1"
          style={{ color: "#f0efe9", fontSize: 13 }}
        >
          {dish.name}
        </h3>
        <p
          className="leading-relaxed line-clamp-2 mb-3"
          style={{ color: "#6e6c5a", fontSize: 11 }}
        >
          {dish.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-bold" style={{ color: "#e6a81e", fontSize: 14 }}>
            {dish.price.toFixed(2)} €
          </span>
          {/* Só mostra kcal se tiver valor real */}
          {dish.calories != null && (
            <span style={{ color: "#484640", fontSize: 10 }}>
              {dish.calories > 0 ? `${dish.calories} kcal` : "0 kcal"}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
