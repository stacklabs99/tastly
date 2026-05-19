"use client";

import { createContext, useContext, useState } from "react";
import type { Locale, TKeys } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type LanguageContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  tr: (key: keyof TKeys) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: "pt",
  setLocale: () => {},
  tr: (key) => t("pt", key),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("pt");
  const tr = (key: keyof TKeys) => t(locale, key);
  return (
    <LanguageContext.Provider value={{ locale, setLocale, tr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
