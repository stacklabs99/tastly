"use client";

import { ALLERGEN_INFO, type Allergen } from "@/types";

type Props = {
  allergen: Allergen;
  size?: "sm" | "md";
};

export function AllergenBadge({ allergen, size = "sm" }: Props) {
  const info = ALLERGEN_INFO[allergen];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 text-dark-300 ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  );
}
