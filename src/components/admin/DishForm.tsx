"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Dish, Allergen, Category, ManualPairings } from "@/types";
import { ALLERGEN_INFO } from "@/types";
import { Check, ChevronLeft, Trash2 } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { PairingsEditor } from "./PairingsEditor";

type DishFormData = Omit<Dish, "id" | "created_at" | "updated_at" | "restaurant_id">;

const DEFAULT_TAGS = [
  "popular", "vegetariano", "vegan", "peixe", "carne",
  "sem-glúten", "sem-lactose", "saudável", "tradicional",
  "cocktail", "com álcool", "sem álcool", "café",
];

const ALL_ALLERGENS = Object.values(ALLERGEN_INFO);

type Props = {
  initial?: Dish;
  categories: Category[];
  dishes?: Dish[];
  slug: string;
  onSave: (data: DishFormData) => void;
  onDelete?: () => void;
  isNew?: boolean;
};

/* ─── Small helpers ───────────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#4a4a3a" }}>
      {children}
    </label>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: "#4a4a3a" }}>
      {children}
    </h3>
  );
}

function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer gap-4">
      <div>
        <p className="text-sm font-medium" style={{ color: "#d4d4c8" }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "#484640" }}>{sub}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
        style={{ background: checked ? "#e6a81e" : "rgba(255,255,255,0.1)" }}
      >
        <span
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? "translateX(21px)" : "translateX(4px)" }}
        />
      </button>
    </label>
  );
}

const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all";
const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#e8e8e0" };
const inputFocusStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(230,168,30,0.4)", color: "#e8e8e0" };

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  const [focused, setFocused] = useState(false);
  const { label, hint, ...rest } = props;
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input
        {...rest}
        className={inputCls}
        style={{ ...(focused ? inputFocusStyle : inputStyle), ...rest.style }}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
      />
      {hint && <p className="text-[11px] mt-1" style={{ color: "#3a3a2a" }}>{hint}</p>}
    </div>
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const [focused, setFocused] = useState(false);
  const { label, ...rest } = props;
  return (
    <div>
      {label && <Label>{label}</Label>}
      <textarea
        {...rest}
        className={`${inputCls} resize-none`}
        style={{ ...(focused ? inputFocusStyle : inputStyle), ...rest.style }}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
      />
    </div>
  );
}

/* ─── Main form ───────────────────────────────────────────────── */

export function DishForm({ initial, categories, dishes = [], slug, onSave, onDelete, isNew }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imgUrl, setImgUrl] = useState(initial?.image_url ?? "");

  const [form, setForm] = useState<DishFormData>(() => ({
    category_id: categories[0]?.id ?? "",
    name: "",
    description: "",
    price: 0,
    image_url: undefined,
    allergens: [],
    calories: undefined,
    proteins: undefined,
    carbs: undefined,
    fat: undefined,
    is_available: true,
    is_featured: false,
    is_special: false,
    tags: [],
    position: 1,
    ...initial,
  }));

  const [tagInput, setTagInput] = useState("");
  const [pairings, setPairings] = useState<ManualPairings>(
    initial?.manual_pairings ?? { wines: [], starters: [], mains: [], desserts: [] }
  );
  const [translationLang, setTranslationLang] = useState<"en" | "es" | "fr">("en");
  const [translations, setTranslations] = useState<Record<string, { name?: string; description?: string }>>(
    initial?.translations ?? {}
  );

  // Sync imgUrl when the `initial` prop changes (e.g. switching between dishes
  // in the same mounted form). Fires once per dish change.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setImgUrl(initial?.image_url ?? ""); }, [initial]);

  const set = <K extends keyof DishFormData>(key: K, val: DishFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const setTranslation = (lang: string, field: "name" | "description", value: string) =>
    setTranslations((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));

  const toggleAllergen = (a: Allergen) =>
    set("allergens", form.allergens.includes(a) ? form.allergens.filter((x) => x !== a) : [...form.allergens, a]);

  const toggleTag = (tag: string) =>
    set("tags", form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag]);

  const addCustomTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, image_url: imgUrl || undefined, manual_pairings: pairings, translations });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave}>
      {/* Back link + title */}
      <div className="flex items-center gap-3 mb-7">
        <button
          type="button"
          onClick={() => router.push(`/menu/${slug}/admin/pratos`)}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
          style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#626250" }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold" style={{ color: "#f5f5f0" }}>
            {isNew ? "Novo Prato" : form.name || "Editar Prato"}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#484640" }}>
            {isNew ? "Preenche os dados e guarda" : "Altera o que precisares e guarda"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── LEFT: main content ── */}
        <div className="xl:col-span-2 space-y-4">

          {/* Identity */}
          <Card>
            <SectionTitle>Identidade</SectionTitle>
            <div className="space-y-4">
              <Field
                required
                label="Nome do Prato"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="ex: Bacalhau à Brás"
              />
              <TextArea
                label="Descrição"
                rows={3}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Ingredientes e método de confeção…"
              />
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <Field
                    required
                    label="Preço (€)"
                    type="number"
                    min={0}
                    step={0.5}
                    value={form.price || ""}
                    onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
                    style={{ paddingRight: "2rem" }}
                  />
                  <span className="absolute right-3 bottom-2.5 text-sm pointer-events-none" style={{ color: "#484640" }}>€</span>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <select
                    value={form.category_id}
                    onChange={(e) => set("category_id", e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} style={{ background: "#1a1916" }}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <Field
                  label="Posição"
                  hint="Menor = primeiro"
                  type="number"
                  min={1}
                  value={form.position || ""}
                  onChange={(e) => set("position", parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </Card>

          {/* Translations */}
          <Card>
            <SectionTitle>Traduções</SectionTitle>
            <div className="flex gap-1.5 mb-4">
              {(["en", "es", "fr"] as const).map((lang) => {
                const labels = { en: "🇬🇧 EN", es: "🇪🇸 ES", fr: "🇫🇷 FR" };
                const active = translationLang === lang;
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setTranslationLang(lang)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={active
                      ? { background: "rgba(230,168,30,0.18)", color: "#e6a81e", border: "1px solid rgba(230,168,30,0.35)" }
                      : { background: "rgba(255,255,255,0.04)", color: "#626250", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    {labels[lang]}
                  </button>
                );
              })}
            </div>
            <div className="space-y-3">
              <Field
                label={`Nome (${translationLang.toUpperCase()})`}
                value={translations[translationLang]?.name ?? ""}
                onChange={(e) => setTranslation(translationLang, "name", e.target.value)}
                placeholder={`Nome do prato em ${translationLang === "en" ? "inglês" : translationLang === "es" ? "espanhol" : "francês"}…`}
              />
              <TextArea
                label={`Descrição (${translationLang.toUpperCase()})`}
                rows={3}
                value={translations[translationLang]?.description ?? ""}
                onChange={(e) => setTranslation(translationLang, "description", e.target.value)}
                placeholder="Descrição traduzida…"
              />
            </div>
          </Card>

          {/* Nutrition */}
          <Card>
            <SectionTitle>Informação Nutricional</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([
                { key: "calories" as const, label: "Calorias", unit: "kcal" },
                { key: "proteins" as const, label: "Proteínas", unit: "g" },
                { key: "carbs" as const, label: "Hidratos", unit: "g" },
                { key: "fat" as const, label: "Gorduras", unit: "g" },
              ] as const).map(({ key, label, unit }) => (
                <Field
                  key={key}
                  label={`${label} (${unit})`}
                  type="number"
                  min={0}
                  value={form[key] ?? ""}
                  onChange={(e) => set(key, e.target.value === "" ? undefined : parseFloat(e.target.value))}
                  placeholder="—"
                />
              ))}
            </div>
          </Card>

          {/* Tags */}
          <Card>
            <SectionTitle>Tags</SectionTitle>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {DEFAULT_TAGS.map((tag) => {
                const active = form.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                    style={active
                      ? { background: "rgba(230,168,30,0.18)", color: "#e6a81e", border: "1px solid rgba(230,168,30,0.35)" }
                      : { background: "rgba(255,255,255,0.04)", color: "#626250", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            {form.tags.filter((t) => !DEFAULT_TAGS.includes(t)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {form.tags.filter((t) => !DEFAULT_TAGS.includes(t)).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: "rgba(230,168,30,0.18)", color: "#e6a81e", border: "1px solid rgba(230,168,30,0.35)" }}
                  >
                    {tag}
                    <button type="button" onClick={() => toggleTag(tag)} className="opacity-60 hover:opacity-100 ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                placeholder="Tag personalizada…"
                className={inputCls}
                style={{ ...inputStyle, maxWidth: 200 }}
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:brightness-110"
                style={{ background: "rgba(230,168,30,0.08)", color: "#e6a81e", border: "1px solid rgba(230,168,30,0.15)" }}
              >
                + Adicionar
              </button>
            </div>
          </Card>

          {/* Manual pairings */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>Sugestão da Casa</SectionTitle>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(126,184,164,0.1)", color: "#7eb8a4" }}>
                Prioritária
              </span>
            </div>
            <p className="text-xs mb-4" style={{ color: "#484640" }}>
              Quando preenchida, estas sugestões aparecem diretamente no menu como &ldquo;Sugestão da Casa&rdquo;.
            </p>
            <PairingsEditor value={pairings} onChange={setPairings} dishes={dishes} categories={categories} />
          </Card>

          {/* Allergens */}
          <Card>
            <SectionTitle>Alergénios</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {ALL_ALLERGENS.map(({ id, label, icon }) => {
                const active = form.allergens.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleAllergen(id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all"
                    style={active
                      ? { background: "rgba(230,168,30,0.1)", color: "#e8e8e0", border: "1px solid rgba(230,168,30,0.25)" }
                      : { background: "rgba(255,255,255,0.02)", color: "#626250", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <span>{icon}</span>
                    <span className="font-medium truncate">{label}</span>
                    {active && <Check className="w-3 h-3 ml-auto text-[#e6a81e] flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ── RIGHT: image, visibility, actions ── */}
        <div className="space-y-4">

          {/* Image upload */}
          <Card>
            <SectionTitle>Fotografia</SectionTitle>
            <ImageUpload value={imgUrl} onChange={setImgUrl} />
          </Card>

          {/* Visibility */}
          <Card className="space-y-4">
            <SectionTitle>Visibilidade</SectionTitle>
            <Toggle
              label="Disponível no menu"
              sub="Visível para os clientes"
              checked={form.is_available}
              onChange={(v) => set("is_available", v)}
            />
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <Toggle
              label="Em Destaque"
              sub="Aparece no carrossel"
              checked={form.is_featured}
              onChange={(v) => set("is_featured", v)}
            />
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <Toggle
              label="Prato do Dia"
              sub="Destacado no topo do menu"
              checked={form.is_special}
              onChange={(v) => set("is_special", v)}
            />
          </Card>

          {/* Actions */}
          <Card className="space-y-3">
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ background: saved ? "#7eb8a4" : "#e6a81e", color: "#1a1916" }}
            >
              {saved ? <><Check className="w-4 h-4" /> Guardado!</> : isNew ? "Criar Prato" : "Guardar Alterações"}
            </button>

            {onDelete && (
              <div className="pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                {confirmDelete ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onDelete}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                      style={{ background: "rgba(230,126,75,0.15)", color: "#e67e4b", border: "1px solid rgba(230,126,75,0.25)" }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Confirmar eliminação
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-2 rounded-xl text-xs transition-colors"
                      style={{ color: "#626250" }}
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="text-xs w-full text-center py-1.5 transition-colors hover:text-[#e67e4b]"
                    style={{ color: "#484640" }}
                  >
                    Eliminar prato
                  </button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </form>
  );
}
