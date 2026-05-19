"use client";

import { useRef, useEffect, useState } from "react";
import type { Category } from "@/types";

type Props = {
  categories: Category[];
  activeId: string;
  onChange: (id: string) => void;
};

export function CategoryTabs({ categories, activeId, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const [showFade, setShowFade] = useState(false);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => setShowFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    check();
    el.addEventListener("scroll", check, { passive: true });
    return () => el.removeEventListener("scroll", check);
  }, [categories]);

  return (
    <div
      className="sticky top-0 z-30"
      style={{
        background: "rgba(26,25,22,0.94)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="relative">
        <div
          ref={containerRef}
          className="flex gap-1.5 px-4 py-3 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          {categories.map((cat) => {
            const isActive = cat.id === activeId;
            return (
              <button
                key={cat.id}
                ref={isActive ? activeRef : null}
                onClick={() => onChange(cat.id)}
                className="whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0"
                style={
                  isActive
                    ? { background: "#e6a81e", color: "#1a1916", fontWeight: 600 }
                    : { color: "#7a7a62" }
                }
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Indicador de scroll à direita */}
        {showFade && (
          <div
            className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none"
            style={{ background: "linear-gradient(to right, transparent, rgba(26,25,22,0.98))" }}
          />
        )}
      </div>
    </div>
  );
}
