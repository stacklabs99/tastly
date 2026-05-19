import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { Dish, DishType } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildPrompt(dish: Dish, dishType: DishType): string {
  const base = `És um sommelier e chef especialista em gastronomia portuguesa e mediterrânica.

O cliente selecionou: "${dish.name}"
Tipo: ${dishType}
Descrição: ${dish.description}
${dish.tags.length > 0 ? `Tags: ${dish.tags.join(", ")}` : ""}
${dish.allergens.length > 0 ? `Alergénios: ${dish.allergens.join(", ")}` : ""}`;

  const instructions: Record<DishType, string> = {
    wine: `Este item É um vinho. Sugere o que combina bem com este vinho:
- 2 entradas que harmonizem (starters)
- 2 pratos principais que combinem (mains)
- 1 sobremesa que complete (desserts)
Deixa wines vazio ([]).`,

    beverage: `Este item É uma bebida. Sugere o que combina com ela:
- 2 entradas que harmonizem (starters)
- 2 pratos principais que combinem (mains)
- 1 sobremesa que complete (desserts)
Deixa wines vazio ([]).`,

    starter: `Este item É uma entrada. Sugere o que se segue:
- 2 vinhos para acompanhar (wines)
- 2 pratos principais que continuem a refeição (mains)
- 1 sobremesa para terminar (desserts)
Deixa starters vazio ([]).`,

    dessert: `Este item É uma sobremesa. Sugere o que complementa:
- 2 vinhos que harmonizem (wines)
- 1 entrada para antes (starters)
- 2 pratos principais que antecedam bem (mains)
Deixa desserts vazio ([]).`,

    main: `Este item É um prato principal. Sugere maridagem completa:
- 2 vinhos que complementem (wines)
- 1 entrada para antes (starters)
- 1 sobremesa para depois (desserts)
Deixa mains vazio ([]).`,

    other: `Sugere maridagem equilibrada:
- 2 vinhos (wines)
- 1 entrada (starters)
- 1 prato principal (mains)
- 1 sobremesa (desserts)`,
  };

  return `${base}

${instructions[dishType]}

Responde em JSON com este formato exato (usa [] para as secções vazias conforme indicado):
{
  "wines": [{"name": "...", "description": "Região, ano", "why": "razão em português"}],
  "starters": [{"name": "...", "description": "descrição curta", "why": "razão em português"}],
  "mains": [{"name": "...", "description": "descrição curta", "why": "razão em português"}],
  "desserts": [{"name": "...", "description": "descrição curta", "why": "razão em português"}],
  "reasoning": "lógica de maridagem em 1-2 frases"
}

Sê específico, elegante e conciso. Usa nomes reais de produtos portugueses.`;
}

export async function POST(request: NextRequest) {
  try {
    const { dish, dishType = "other" }: { dish: Dish; dishType: DishType } = await request.json();

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 900,
      messages: [{ role: "user", content: buildPrompt(dish, dishType) }],
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
