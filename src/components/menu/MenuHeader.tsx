"use client";

import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import type { Restaurant } from "@/types";
import { LanguageSwitcher } from "@/components/menu/LanguageSwitcher";

type Props = { restaurant: Restaurant };

export function MenuHeader({ restaurant }: Props) {
  return (
    <div className="relative">
      {/* Cover — full bleed, cinemático */}
      <div className="relative overflow-hidden" style={{ height: 300 }}>
        {restaurant.cover_url ? (
          <Image
            src={restaurant.cover_url}
            alt={restaurant.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div style={{ background: "linear-gradient(135deg,#2a2018 0%,#1a1916 100%)" }} className="absolute inset-0" />
        )}

        {/* Gradiente para dark bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(26,25,22,0.08) 0%, rgba(26,25,22,0.45) 55%, #1a1916 100%)",
          }}
        />

        {/* Language switcher — top right */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>

        {/* Tipo de cozinha — top left */}
        {restaurant.cuisine_type && (
          <div className="absolute top-4 left-4">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.15em] px-3 py-1 rounded-full"
              style={{
                background: "rgba(26,25,22,0.6)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(230,168,30,0.35)",
                color: "#e6a81e",
              }}
            >
              {restaurant.cuisine_type}
            </span>
          </div>
        )}

        {/* Nome + subtítulo sobre o cover */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 flex items-end gap-3">
          {restaurant.logo_url && (
            <div
              className="flex-shrink-0 w-14 h-14 rounded-2xl overflow-hidden mb-0.5 ring-2"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.5)", border: "2px solid rgba(255,255,255,0.12)" }}
            >
              <Image
                src={restaurant.logo_url}
                alt={`${restaurant.name} logo`}
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-white font-bold leading-none" style={{ fontSize: 32, letterSpacing: "-0.01em" }}>
              {restaurant.name}
            </h1>
            {restaurant.description && (
              <p className="text-white/60 text-sm leading-snug mt-1.5 line-clamp-2">
                {restaurant.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Barra inferior — morada + tel */}
      {(restaurant.address || restaurant.phone) && (
        <div
          className="flex items-center gap-4 px-5 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {restaurant.address && (
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#7a7a62" }} />
              <span className="text-xs truncate" style={{ color: "#7a7a62" }}>
                {restaurant.address}
              </span>
            </div>
          )}
          {restaurant.phone && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Phone className="w-3.5 h-3.5" style={{ color: "#7a7a62" }} />
              <span className="text-xs" style={{ color: "#7a7a62" }}>
                {restaurant.phone}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
