import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { checkAiUsage, incrementAiUsage } from "@/lib/ai-usage";

// Lazy — avoid constructing (and throwing on a missing key) at module load.
let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const PROMPT = `És um assistente que extrai a estrutura de um menu de restaurante a partir de uma imagem ou PDF.

Extrai TODAS as categorias e pratos visíveis. Para cada prato: nome, descrição (se existir, senão string vazia) e preço (número em euros, sem símbolo).

Regras:
- Preços como número decimal (ex: 12.50). Se um prato não tiver preço visível, usa 0.
- Não inventes pratos nem preços que não estejam no documento.
- Mantém os nomes e descrições na língua original do menu.
- Ignora texto que não seja pratos (moradas, horários, rodapés).

Responde APENAS com JSON válido neste formato exato:
{
  "categories": [
    { "name": "Entradas", "dishes": [ { "name": "Croquetes", "description": "...", "price": 8.5 } ] }
  ]
}`;

async function resolveRestaurant(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado", status: 401 as const };

  const superAdmins = (process.env.SUPER_ADMIN_EMAILS ?? process.env.SUPER_ADMIN_EMAIL ?? "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isSuperAdmin = superAdmins.includes((user.email ?? "").toLowerCase());

  let query = createSupabaseServiceClient().from("restaurants").select("id").eq("slug", slug);
  if (!isSuperAdmin) query = query.eq("owner_id", user.id);
  const { data } = await query.single();
  if (!data) return { error: "Acesso negado", status: 403 as const };
  return { restaurantId: data.id as string };
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const slug = formData.get("slug");

  if (typeof slug !== "string" || !slug) {
    return NextResponse.json({ error: "Restaurante inválido" }, { status: 400 });
  }

  const resolved = await resolveRestaurant(slug);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }
  const { restaurantId } = resolved;

  if (!file) return NextResponse.json({ error: "Nenhum ficheiro" }, { status: 400 });
  const isImage = (IMAGE_TYPES as readonly string[]).includes(file.type);
  const isPdf = file.type === "application/pdf";
  if (!isImage && !isPdf) {
    return NextResponse.json({ error: "Formato inválido. Usa JPEG, PNG, WebP ou PDF." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Ficheiro demasiado grande. Máx. 10 MB." }, { status: 400 });
  }

  if (!await checkAiUsage(restaurantId)) {
    return NextResponse.json({ error: "Limite mensal de IA atingido para este restaurante." }, { status: 429 });
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  const fileBlock = isPdf
    ? { type: "document" as const, source: { type: "base64" as const, media_type: "application/pdf" as const, data: base64 } }
    : { type: "image" as const, source: { type: "base64" as const, media_type: file.type as "image/jpeg" | "image/png" | "image/webp", data: base64 } };

  try {
    const message = await client().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8000,
      messages: [{
        role: "user",
        content: [fileBlock, { type: "text", text: PROMPT }],
      }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]) as {
      categories?: { name?: unknown; dishes?: { name?: unknown; description?: unknown; price?: unknown }[] }[];
    };

    // Sanitise into a safe, bounded shape
    const categories = (Array.isArray(parsed.categories) ? parsed.categories : [])
      .slice(0, 30)
      .map((c) => ({
        name: typeof c.name === "string" ? c.name.slice(0, 100) : "",
        dishes: (Array.isArray(c.dishes) ? c.dishes : []).slice(0, 100).map((d) => ({
          name: typeof d.name === "string" ? d.name.slice(0, 100) : "",
          description: typeof d.description === "string" ? d.description.slice(0, 600) : "",
          price: typeof d.price === "number" && isFinite(d.price) ? Math.max(0, Math.min(9999, d.price)) : 0,
        })).filter((d) => d.name),
      }))
      .filter((c) => c.name && c.dishes.length > 0);

    await incrementAiUsage(restaurantId);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Menu import error:", error);
    return NextResponse.json({ error: "Não foi possível ler o menu. Tenta outra imagem ou PDF mais nítido." }, { status: 500 });
  }
}
