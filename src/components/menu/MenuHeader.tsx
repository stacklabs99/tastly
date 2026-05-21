"use client";

import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import type { Restaurant } from "@/types";
import { LanguageSwitcher } from "@/components/menu/LanguageSwitcher";

type Props = { restaurant: Restaurant };

export function MenuHeader({ restaurant }: Props) {
  return (
    <div className="relative">
      {/* Cover */}
      <div className="relative overflow-hidden" style={{ height: 420 }}>
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

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(26,25,22,0.05) 0%, rgba(26,25,22,0.25) 40%, rgba(26,25,22,0.82) 75%, #1a1916 100%)",
          }}
        />

        {/* Language switcher */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>

        {/* Cuisine type chip */}
        {restaurant.cuisine_type && (
          <div className="absolute top-4 left-4">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.15em] px-3 py-1 rounded-full"
              style={{
                background: "rgba(26,25,22,0.55)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(230,168,30,0.4)",
                color: "#e6a81e",
              }}
            >
              {restaurant.cuisine_type}
            </span>
          </div>
        )}

        {/* Name + description bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
          {restaurant.logo_url && (
            <div
              className="w-14 h-14 rounded-2xl overflow-hidden mb-3"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.6)", border: "2px solid rgba(255,255,255,0.14)" }}
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
          <h1
            className="font-serif text-white font-bold leading-none"
            style={{ fontSize: "clamp(36px, 10vw, 52px)", letterSpacing: "-0.02em", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          >
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p
              className="mt-2 leading-snug"
              style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, maxWidth: 380, textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
            >
              {restaurant.description}
            </p>
          )}
        </div>
      </div>

      {/* Info bar — clickable, prominent */}
      {(restaurant.address || restaurant.phone) && (
        <div
          className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3.5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "#1a1916" }}
        >
          {restaurant.address && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 min-w-0 active:opacity-70 transition-opacity"
            >
              <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#e6a81e" }} />
              <span className="text-sm truncate" style={{ color: "#b8b8a0" }}>
                {restaurant.address}
              </span>
            </a>
          )}
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 flex-shrink-0 active:opacity-70 transition-opacity"
            >
              <Phone className="w-4 h-4" style={{ color: "#e6a81e" }} />
              <span className="text-sm font-medium" style={{ color: "#b8b8a0" }}>
                {restaurant.phone}
              </span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
