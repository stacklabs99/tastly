import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Rate limit: 20 uploads / IP / 60 s
const rl = new Map<string, { n: number; reset: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rl.get(ip);
  if (!entry || now > entry.reset) { rl.set(ip, { n: 1, reset: now + 60_000 }); return true; }
  if (entry.n >= 20) return false;
  entry.n++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Demasiados pedidos. Aguarda um momento." }, { status: 429, headers: { "Retry-After": "60" } });
  }

  // Verify authenticated user
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Verify user owns at least one restaurant (is an actual admin, not just any auth user)
  const service = createSupabaseServiceClient();
  const { count } = await service
    .from("restaurants")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);
  if (!count || count === 0) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "Nenhum ficheiro" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Formato inválido. Usa JPEG, PNG ou WebP." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Ficheiro demasiado grande. Máx. 5 MB." }, { status: 400 });

  // Sanitise extension — only allow known image extensions regardless of filename
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  const ext = mimeToExt[file.type];
  const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error } = await service.storage
    .from("dish-images")
    .upload(filename, Buffer.from(bytes), { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = service.storage.from("dish-images").getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl });
}
