import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { needsTranslation } from "@/lib/ai-translate";

// ── needsTranslation ──────────────────────────────────────────────────────────

describe("needsTranslation", () => {
  it("returns true when translations is undefined", () => {
    expect(needsTranslation(undefined)).toBe(true);
  });

  it("returns true when translations is an empty object", () => {
    expect(needsTranslation({})).toBe(true);
  });

  it("returns true when only one locale is present", () => {
    expect(needsTranslation({ en: { name: "Rice" } })).toBe(true);
  });

  it("returns true when only two locales are present", () => {
    expect(needsTranslation({
      en: { name: "Rice" },
      es: { name: "Arroz" },
    })).toBe(true);
  });

  it("returns true when a locale exists but name is an empty string", () => {
    expect(needsTranslation({
      en: { name: "" },
      es: { name: "Arroz" },
      fr: { name: "Riz" },
    })).toBe(true);
  });

  it("returns true when a locale has description but no name", () => {
    expect(needsTranslation({
      en: { description: "Some desc" },
      es: { name: "Arroz" },
      fr: { name: "Riz" },
    })).toBe(true);
  });

  it("returns false when all three locales have a name", () => {
    expect(needsTranslation({
      en: { name: "Rice", description: "Boiled rice" },
      es: { name: "Arroz", description: "Arroz cocido" },
      fr: { name: "Riz", description: "Riz cuit" },
    })).toBe(false);
  });

  it("returns false when all three locales have a name but no description", () => {
    expect(needsTranslation({
      en: { name: "Rice" },
      es: { name: "Arroz" },
      fr: { name: "Riz" },
    })).toBe(false);
  });

  it("ignores extra locales — only checks en, es, fr", () => {
    expect(needsTranslation({
      pt: { name: "Arroz" },
      de: { name: "Reis" },
    })).toBe(true);

    expect(needsTranslation({
      en: { name: "Rice" },
      es: { name: "Arroz" },
      fr: { name: "Riz" },
      pt: { name: "Arroz" },
    })).toBe(false);
  });
});

// ── autoTranslateDish — mocked Anthropic ─────────────────────────────────────

describe("autoTranslateDish", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when ANTHROPIC_API_KEY is not set", async () => {
    const original = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    const { autoTranslateDish } = await import("@/lib/ai-translate");
    const result = await autoTranslateDish("Bacalhau", "Peixe salgado.");
    expect(result).toBeNull();

    process.env.ANTHROPIC_API_KEY = original;
  });

  it("returns parsed translations on valid API response", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";

    const mockResponse = {
      en: { name: "Salt Cod", description: "Salted dried cod." },
      es: { name: "Bacalao", description: "Bacalao salado." },
      fr: { name: "Morue", description: "Morue salée." },
    };

    vi.doMock("@anthropic-ai/sdk", () => ({
      default: class {
        messages = {
          create: vi.fn().mockResolvedValue({
            content: [{ type: "text", text: JSON.stringify(mockResponse) }],
          }),
        };
      },
    }));

    const { autoTranslateDish } = await import("@/lib/ai-translate");
    const result = await autoTranslateDish("Bacalhau", "Peixe salgado.");

    expect(result).toEqual(mockResponse);
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("returns null when API response contains invalid JSON", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";

    vi.doMock("@anthropic-ai/sdk", () => ({
      default: class {
        messages = {
          create: vi.fn().mockResolvedValue({
            content: [{ type: "text", text: "Sorry, I cannot translate that." }],
          }),
        };
      },
    }));

    const { autoTranslateDish } = await import("@/lib/ai-translate");
    const result = await autoTranslateDish("Bacalhau", "Peixe salgado.");

    expect(result).toBeNull();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("returns null when response JSON is missing required locale keys", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";

    vi.doMock("@anthropic-ai/sdk", () => ({
      default: class {
        messages = {
          create: vi.fn().mockResolvedValue({
            content: [{ type: "text", text: '{"en":{"name":"Salt Cod"},"es":{}}' }],
          }),
        };
      },
    }));

    const { autoTranslateDish } = await import("@/lib/ai-translate");
    const result = await autoTranslateDish("Bacalhau", "Peixe salgado.");

    expect(result).toBeNull();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("returns null when the Anthropic SDK throws", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";

    vi.doMock("@anthropic-ai/sdk", () => ({
      default: class {
        messages = {
          create: vi.fn().mockRejectedValue(new Error("Network error")),
        };
      },
    }));

    const { autoTranslateDish } = await import("@/lib/ai-translate");
    const result = await autoTranslateDish("Bacalhau", "Peixe salgado.");

    expect(result).toBeNull();
    delete process.env.ANTHROPIC_API_KEY;
  });
});
