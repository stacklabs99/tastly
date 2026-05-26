import { describe, it, expect } from "vitest";
import { DIET_FILTERS, normTag, tagsMatchDiet, passesDiet, passesAllergens } from "@/lib/diet";

describe("normTag", () => {
  it("lowercases, trims, strips accents and hyphenates spaces", () => {
    expect(normTag("Sem Glúten")).toBe("sem-gluten");
    expect(normTag("  Vegetariano  ")).toBe("vegetariano");
    expect(normTag("sem-glúten")).toBe("sem-gluten");
  });
});

describe("tagsMatchDiet", () => {
  it("matches gluten-free across accent/space variants", () => {
    expect(tagsMatchDiet(["sem-glúten"], "gluten")).toBe(true);
    expect(tagsMatchDiet(["sem glúten"], "gluten")).toBe(true);
    expect(tagsMatchDiet(["sem-gluten"], "gluten")).toBe(true);
  });

  it("matches vegetariano and its feminine form", () => {
    expect(tagsMatchDiet(["vegetariano"], "vegetariano")).toBe(true);
    expect(tagsMatchDiet(["vegetariana"], "vegetariano")).toBe(true);
  });

  it("matches vegan variants (vegan/vegano/vegana)", () => {
    expect(tagsMatchDiet(["vegan"], "vegan")).toBe(true);
    expect(tagsMatchDiet(["vegano"], "vegan")).toBe(true);
  });

  it("returns false when the tag is absent", () => {
    expect(tagsMatchDiet(["peixe", "popular"], "vegan")).toBe(false);
  });

  it("returns false for an unknown filter id", () => {
    expect(tagsMatchDiet(["vegan"], "halal")).toBe(false);
  });
});

describe("passesDiet (AND across active filters)", () => {
  it("passes when no filters are active", () => {
    expect(passesDiet(["peixe"], new Set())).toBe(true);
  });

  it("passes only when the dish matches every active filter", () => {
    const tags = ["vegan", "sem-glúten"];
    expect(passesDiet(tags, new Set(["vegan"]))).toBe(true);
    expect(passesDiet(tags, new Set(["vegan", "gluten"]))).toBe(true);
    expect(passesDiet(tags, new Set(["vegan", "gluten", "lactose"]))).toBe(false);
  });

  it("fails when the dish matches none of the active filters", () => {
    expect(passesDiet(["carne"], new Set(["vegetariano"]))).toBe(false);
  });
});

describe("passesAllergens (exclude logic)", () => {
  it("passes when nothing is excluded", () => {
    expect(passesAllergens(["crustaceos", "peixe"], new Set())).toBe(true);
  });

  it("excludes a dish that contains an excluded allergen", () => {
    expect(passesAllergens(["crustaceos"], new Set(["crustaceos"]))).toBe(false);
  });

  it("keeps a dish that contains none of the excluded allergens", () => {
    expect(passesAllergens(["peixe"], new Set(["crustaceos", "amendoins"]))).toBe(true);
  });

  it("excludes if the dish contains ANY one of several excluded allergens", () => {
    expect(passesAllergens(["leite", "ovos"], new Set(["amendoins", "leite"]))).toBe(false);
  });

  it("keeps a dish with no allergens regardless of exclusions", () => {
    expect(passesAllergens([], new Set(["crustaceos", "gluten"]))).toBe(true);
  });
});

describe("DIET_FILTERS config", () => {
  it("exposes the four expected dietary filters", () => {
    expect(DIET_FILTERS.map((f) => f.id)).toEqual(["vegetariano", "vegan", "gluten", "lactose"]);
  });
});
