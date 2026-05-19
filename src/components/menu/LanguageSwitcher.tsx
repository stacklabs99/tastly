"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { LOCALES } from "@/lib/i18n";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const active = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-semibold transition-all active:scale-95"
        style={{
          background: "rgba(26,25,22,0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#f5f5f0",
        }}
      >
        <span className="text-base leading-none">{active.flag}</span>
        <span>{active.label}</span>
        <ChevronDown
          className="w-3 h-3 transition-transform duration-200"
          style={{
            color: "rgba(255,255,255,0.5)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden min-w-[110px]"
          style={{
            background: "rgba(26,25,22,0.95)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {LOCALES.map((l) => {
            const isActive = l.code === locale;
            return (
              <button
                key={l.code}
                onClick={() => { setLocale(l.code); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium transition-colors text-left"
                style={
                  isActive
                    ? { background: "rgba(230,168,30,0.15)", color: "#e6a81e" }
                    : { color: "rgba(255,255,255,0.7)" }
                }
              >
                <span className="text-base leading-none">{l.flag}</span>
                <span>{l.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#e6a81e]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
