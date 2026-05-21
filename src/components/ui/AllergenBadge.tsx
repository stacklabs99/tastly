"use client";

import { type Allergen, ALLERGEN_INFO } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TKeys } from "@/lib/i18n";

type Props = {
  allergen: Allergen;
  size?: "sm" | "md";
};

export function AllergenBadge({ allergen, size = "sm" }: Props) {
  const { tr } = useLanguage();
  const info = ALLERGEN_INFO[allergen];
  const label = tr(`allergen_${allergen}` as keyof TKeys);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 text-dark-300 ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <span>{info.icon}</span>
      <span>{label}</span>
    </span>
  );
}
