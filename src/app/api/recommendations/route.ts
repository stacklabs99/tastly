import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { Dish, DishType } from "@/types";
import { checkAiUsage, incrementAiUsage } from "@/lib/ai-usage";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Rate limiting: 10 requests / IP / 60 s ───────────────────────────────────
const rl = new Map<string, { n: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rl.get(ip);
  if (!entry || now > entry.reset) {
    rl.set(ip, { n: 1, reset: now + 60_000 });
    return true;
  }
  if (entry.n >= 10) return false;
  entry.n++;
  return true;
}

// ── Prompt builder ────────────────────────────────────────────────────────────

const RESPONSE_LANG: Record<string, string> = {
  pt: "Responde sempre em português.",
  en: "Always respond in English.",
  es: "Responde siempre en español.",
  fr: "Réponds toujours en français.",
};

function buildPrompt(dish: Dish, dishType: DishType, locale: string): string {
  const langInstruction = RESPONSE_LANG[locale] ?? RESPONSE_LANG.pt;

  const base = `You are a sommelier and chef specialising in Portuguese and Mediterranean gastronomy.

Selected item: "${dish.name}"
Type: ${dishType}
Description: ${dish.description}
${dish.tags.length > 0 ? `Tags: ${dish.tags.join(", ")}` : ""}
${dish.allergens.length > 0 ? `Allergens: ${dish.allergens.join(", ")}` : ""}`;

  const instructions: Record<DishType, string> = {
    wine: `This item IS a wine. Suggest what pairs well with it:
- 2 starters that harmonise (starters)
- 2 main courses that pair well (mains)
- 1 dessert to complete (desserts)
Leave wines empty ([]).`,
    beverage: `This item IS a beverage. Suggest what pairs with it:
- 2 starters that harmonise (starters)
- 2 main courses that pair well (mains)
- 1 dessert to complete (desserts)
Leave wines empty ([]).`,
    starter: `This item IS a starter. Suggest what follows:
- 2 wines to accompany (wines)
- 2 main courses to continue the meal (mains)
- 1 dessert to finish (desserts)
Leave starters empty ([]).`,
    dessert: `This item IS a dessert. Suggest what complements it:
- 2 wines that harmonise (wines)
- 1 starter to precede (starters)
- 2 main courses that lead up well (mains)
Leave desserts empty ([]).`,
    main: `This item IS a main course. Suggest a complete pairing:
- 2 wines that complement (wines)
- 1 starter to precede (starters)
- 1 dessert to follow (desserts)
Leave mains empty ([]).`,
    other: `Suggest a balanced pairing:
- 2 wines (wines)
- 1 starter (starters)
- 1 main course (mains)
- 1 dessert (desserts)`,
  };

  return `${base}

${instructions[dishType]}

${langInstruction}

Respond in JSON with this exact format (use [] for empty sections as indicated):
{
  "wines": [{"name": "...", "description": "Region, year", "why": "pairing reason"}],
  "starters": [{"name": "...", "description": "short description", "why": "pairing reason"}],
  "mains": [{"name": "...", "description": "short description", "why": "pairing reason"}],
  "desserts": [{"name": "...", "description": "short description", "why": "pairing reason"}],
  "reasoning": "pairing logic in 1-2 sentences"
}

Be specific, elegant and concise. Use real Portuguese product names.`;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Aguarda um momento." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Basic input validation
  const { dish, dishType = "other", locale = "pt" } = body as {
    dish?: unknown;
    dishType?: unknown;
    locale?: unknown;
  };

  if (!dish || typeof dish !== "object") {
    return NextResponse.json({ error: "Prato inválido" }, { status: 400 });
  }

  const d = dish as Record<string, unknown>;
  if (typeof d.name !== "string" || d.name.trim().length === 0 || d.name.length > 200) {
    return NextResponse.json({ error: "Nome do prato inválido" }, { status: 400 });
  }

  const validDishTypes: DishType[] = ["wine", "beverage", "starter", "dessert", "main", "other"];
  const safeDishType: DishType = validDishTypes.includes(dishType as DishType)
    ? (dishType as DishType)
    : "other";

  const safeLocale = ["pt", "en", "es", "fr"].includes(locale as string)
    ? (locale as string)
    : "pt";

  const restaurantId = typeof d.restaurant_id === "string" ? d.restaurant_id : null;
  if (restaurantId && !await checkAiUsage(restaurantId)) {
    return NextResponse.json(
      { error: "Limite mensal de sugestões atingido para este restaurante." },
      { status: 429 }
    );
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 900,
      messages: [{ role: "user", content: buildPrompt(d as unknown as Dish, safeDishType, safeLocale) }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const rec = JSON.parse(jsonMatch[0]);
    if (restaurantId) await incrementAiUsage(restaurantId);
    return NextResponse.json({
      wines: Array.isArray(rec.wines) ? rec.wines.slice(0, 4) : [],
      starters: Array.isArray(rec.starters) ? rec.starters.slice(0, 4) : [],
      mains: Array.isArray(rec.mains) ? rec.mains.slice(0, 4) : [],
      desserts: Array.isArray(rec.desserts) ? rec.desserts.slice(0, 4) : [],
      reasoning: typeof rec.reasoning === "string" ? rec.reasoning.slice(0, 400) : "",
    });
  } catch (error) {
    console.error("AI recommendation error:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
