import Anthropic from "@anthropic-ai/sdk";

// Lazy — the Anthropic constructor throws on a missing key, which would crash
// at module load for any route importing this file. Only built when a key exists.
let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

type DishTranslations = Record<"en" | "es" | "fr", { name: string; description: string }>;

export async function autoTranslateDish(
  name: string,
  description: string
): Promise<DishTranslations | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const prompt = `You are a restaurant menu translator. Translate the following Portuguese dish name and description into English, Spanish, and French.

Dish name: ${name}
Description: ${description}

Rules:
- Keep translations natural and appetizing, not literal
- For dish names, prefer commonly known translations (e.g. "Bacalhau à Brás" → "Bacalhau à Brás" in EN if it's a known dish, or translate if it has a clear equivalent)
- Descriptions should sound appealing to diners
- Keep the same tone and length as the original

Respond with ONLY valid JSON in this exact format:
{
  "en": { "name": "...", "description": "..." },
  "es": { "name": "...", "description": "..." },
  "fr": { "name": "...", "description": "..." }
}`;

  try {
    const msg = await client().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as DishTranslations;
    if (!parsed.en?.name || !parsed.es?.name || !parsed.fr?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function needsTranslation(
  translations: Record<string, { name?: string; description?: string }> | undefined
): boolean {
  if (!translations) return true;
  return !translations.en?.name || !translations.es?.name || !translations.fr?.name;
}
