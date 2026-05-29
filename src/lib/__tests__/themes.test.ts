import { describe, it, expect } from "vitest";
import { THEMES, getTheme } from "@/lib/themes";

describe("themes", () => {
  it("exposes the four expected themes", () => {
    expect(THEMES.map((t) => t.id)).toEqual(["elegante", "moderno", "classico", "descontraido"]);
  });

  it("every theme defines a heading and body font", () => {
    for (const t of THEMES) {
      expect(t.heading).toBeTruthy();
      expect(t.body).toBeTruthy();
    }
  });

  it("getTheme returns the matching preset", () => {
    expect(getTheme("moderno").id).toBe("moderno");
    expect(getTheme("classico").id).toBe("classico");
  });

  it("getTheme falls back to elegante for unknown/empty input", () => {
    expect(getTheme("nope").id).toBe("elegante");
    expect(getTheme(null).id).toBe("elegante");
    expect(getTheme(undefined).id).toBe("elegante");
  });
});
