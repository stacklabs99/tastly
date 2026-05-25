import { describe, it, expect } from "vitest";
import { t, getLocalized, translateTag, translateCategoryName, LOCALES } from "@/lib/i18n";
import type { TKeys, Locale } from "@/lib/i18n";

// ── getLocalized ──────────────────────────────────────────────────────────────

describe("getLocalized", () => {
  const dish = {
    name: "Polvo à Lagareiro",
    description: "Polvo assado no forno.",
    translations: {
      en: { name: "Octopus à Lagareiro", description: "Oven-roasted octopus." },
      es: { name: "Pulpo à Lagareiro", description: "Pulpo al horno." },
      fr: { name: "Poulpe à Lagareiro", description: "Poulpe rôti au four." },
    },
  };

  it("returns the translated name for a known locale", () => {
    expect(getLocalized(dish, "en", "name")).toBe("Octopus à Lagareiro");
    expect(getLocalized(dish, "es", "name")).toBe("Pulpo à Lagareiro");
    expect(getLocalized(dish, "fr", "name")).toBe("Poulpe à Lagareiro");
  });

  it("returns the translated description for a known locale", () => {
    expect(getLocalized(dish, "en", "description")).toBe("Oven-roasted octopus.");
  });

  it("falls back to base name when locale is not in translations", () => {
    expect(getLocalized(dish, "pt", "name")).toBe("Polvo à Lagareiro");
    expect(getLocalized(dish, "ja", "name")).toBe("Polvo à Lagareiro");
  });

  it("falls back to base description when locale is missing", () => {
    expect(getLocalized(dish, "pt", "description")).toBe("Polvo assado no forno.");
  });

  it("falls back when translations object is undefined", () => {
    const plain = { name: "Bacalhau", description: "Peixe salgado." };
    expect(getLocalized(plain, "en", "name")).toBe("Bacalhau");
    expect(getLocalized(plain, "en", "description")).toBe("Peixe salgado.");
  });

  it("falls back when a specific locale key is missing from translations", () => {
    const partial = {
      name: "Arroz",
      translations: { en: { name: "Rice" } },
    };
    expect(getLocalized(partial, "es", "name")).toBe("Arroz");
  });

  it("returns empty string when description is undefined and locale is missing", () => {
    const noDesc = { name: "Prato" };
    expect(getLocalized(noDesc, "en", "description")).toBe("");
  });
});

// ── translateTag ──────────────────────────────────────────────────────────────

describe("translateTag", () => {
  const makeTr = (locale: Locale) => (key: keyof TKeys) => t(locale, key);

  const cases: Array<[string, Locale, string]> = [
    ["popular", "en", "popular"],
    ["popular", "es", "popular"],
    ["popular", "fr", "populaire"],
    ["sem-glúten", "en", "gluten-free"],
    ["sem glúten", "en", "gluten-free"],
    ["sem-gluten", "en", "gluten-free"],
    ["saudável", "en", "healthy"],
    ["saudavel", "en", "healthy"],
    ["sem-lactose", "en", "lactose-free"],
    ["sem lactose", "es", "sin lactosa"],
    ["tradicional", "fr", "traditionnel"],
    ["tinto", "en", "red"],
    ["branco", "en", "white"],
    ["rosé", "en", "rosé"],
    ["rose", "fr", "rosé"],
    ["cocktail", "es", "cóctel"],
    ["cóctel", "es", "cóctel"],
    ["com álcool", "en", "with alcohol"],
    ["sem álcool", "fr", "sans alcool"],
    ["cerveja", "en", "beer"],
    ["café", "en", "coffee"],
    ["cafe", "en", "coffee"],
  ];

  it.each(cases)('translateTag("%s", %s) → "%s"', (tag, locale, expected) => {
    expect(translateTag(tag, makeTr(locale))).toBe(expected);
  });

  it("returns unknown tags unchanged", () => {
    const tr = makeTr("en");
    expect(translateTag("veganismo", tr)).toBe("veganismo");
    expect(translateTag("novidade", tr)).toBe("novidade");
  });

  it("is case-insensitive", () => {
    const tr = makeTr("en");
    expect(translateTag("POPULAR", tr)).toBe("popular");
    expect(translateTag("Cerveja", tr)).toBe("beer");
  });
});

// ── translateCategoryName ─────────────────────────────────────────────────────

describe("translateCategoryName", () => {
  const makeTr = (locale: Locale) => (key: keyof TKeys) => t(locale, key);

  it("translates starters", () => {
    const tr = makeTr("en");
    expect(translateCategoryName("Entradas", tr)).toBe("Starters");
    expect(translateCategoryName("Entrantes", tr)).toBe("Starters");
  });

  it("translates main courses", () => {
    const tr = makeTr("en");
    expect(translateCategoryName("Pratos Principais", tr)).toBe("Main Courses");
    expect(translateCategoryName("Prato do Dia", tr)).toBe("Main Courses");
  });

  it("translates desserts", () => {
    const tr = makeTr("fr");
    expect(translateCategoryName("Sobremesas", tr)).toBe("Desserts");
    expect(translateCategoryName("Desserts Maison", tr)).toBe("Desserts");
  });

  it("translates wines", () => {
    const tr = makeTr("es");
    expect(translateCategoryName("Vinhos", tr)).toBe("Vinos");
    expect(translateCategoryName("Wine List", tr)).toBe("Vinos");
  });

  it("translates beverages", () => {
    const tr = makeTr("en");
    expect(translateCategoryName("Bebidas", tr)).toBe("Beverages");
    expect(translateCategoryName("Drinks & Cocktails", tr)).toBe("Beverages");
  });

  it("translates palate cleansers", () => {
    const tr = makeTr("en");
    expect(translateCategoryName("Corta-Sabores", tr)).toBe("Palate Cleansers");
    expect(translateCategoryName("Corta Sabores", tr)).toBe("Palate Cleansers");
  });

  it("returns unknown category names unchanged", () => {
    const tr = makeTr("en");
    expect(translateCategoryName("Menu de Degustação", tr)).toBe("Menu de Degustação");
    expect(translateCategoryName("Especial do Chef", tr)).toBe("Especial do Chef");
  });
});

// ── t() completeness ──────────────────────────────────────────────────────────

describe("t()", () => {
  it("returns a non-empty string for every key in every locale", () => {
    const locales: Locale[] = ["pt", "en", "es", "fr"];
    const sampleKeys: (keyof TKeys)[] = [
      "featured", "close", "soldOut", "allergens", "cat_starters", "cat_mains",
      "cat_desserts", "cat_wines", "cat_beverages", "cat_palate",
      "allergen_gluten", "allergen_ovos", "allergen_frutos_casca",
    ];
    for (const locale of locales) {
      for (const key of sampleKeys) {
        const val = t(locale, key);
        expect(val, `t("${locale}", "${key}") must be a non-empty string`).toBeTruthy();
      }
    }
  });

  it("LOCALES array has exactly 4 entries with expected codes", () => {
    expect(LOCALES.map((l) => l.code)).toEqual(["pt", "en", "es", "fr"]);
  });
});
