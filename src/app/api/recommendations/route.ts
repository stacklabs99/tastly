import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { Dish, DishType } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

export async function POST(request: NextRequest) {
  try {
    const { dish, dishType = "other", locale = "pt" }: { dish: Dish; dishType: DishType; locale: string } = await request.json();

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 900,
      messages: [{ role: "user", content: buildPrompt(dish, dishType, locale) }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const rec = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      wines: rec.wines ?? [],
      starters: rec.starters ?? [],
      mains: rec.mains ?? [],
      desserts: rec.desserts ?? [],
      reasoning: rec.reasoning ?? "",
    });
  } catch (error) {
    console.error("AI recommendation error:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
