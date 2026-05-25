"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { X, Sparkles, Wine, Salad, Cake, UtensilsCrossed, ChevronDown, RefreshCw } from "lucide-react";
import type { Dish, AIRecommendation, DishType, Category } from "@/types";
import { AllergenBadge } from "@/components/ui/AllergenBadge";
import { NutritionBar } from "@/components/ui/NutritionBar";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TKeys } from "@/lib/i18n";
import { translateTag, getLocalized } from "@/lib/i18n";
import { track } from "@/lib/track";

type Props = {
  dish: Dish | null;
  categories: Category[];
  onClose: () => void;
};

function getCategoryType(categoryName: string): DishType {
  const n = categoryName.toLowerCase();
  if (n.includes("vinho") || n.includes("wine")) return "wine";
  if (n.includes("entrada") || n.includes("starter")) return "starter";
  if (n.includes("sobremesa") || n.includes("dessert")) return "dessert";
  if (n.includes("bebida") || n.includes("drink") || n.includes("cocktail")) return "beverage";
  if (n.includes("principal") || n.includes("main")) return "main";
  return "other";
}

function getFallbackForDish(dish: Dish, dishType: DishType, tr: (key: keyof TKeys) => string): AIRecommendation {
  const tags = dish.tags.map((t) => t.toLowerCase());
  const name = dish.name.toLowerCase();
  const isSeafood = tags.includes("peixe") || name.includes("bacalhau") || name.includes("polvo") || name.includes("robalo") || name.includes("lingueirão");
  const isMeat = tags.includes("carne") || name.includes("porco") || name.includes("borrego");

  const winesSeafood = [
    { name: "Esporão Reserva Branco", description: "Alentejo, 2022", why: tr("fallback_w_sf_1") },
    { name: "Niepoort Nat'Cool Rosé", description: "Douro, 2023", why: tr("fallback_w_sf_2") },
  ];
  const winesMeat = [
    { name: "Quinta do Crasto Reserva", description: "Douro, 2021", why: tr("fallback_w_mt_1") },
    { name: "Herdade do Esporão Tinto", description: "Alentejo, 2020", why: tr("fallback_w_mt_2") },
  ];
  const winesDefault = [
    { name: "Quinta do Crasto Reserva", description: "Douro, 2021", why: tr("fallback_w_df_1") },
    { name: "Esporão Reserva Branco", description: "Alentejo, 2022", why: tr("fallback_w_df_2") },
  ];

  const starterDefault = [{ name: "Polvo à Lagareiro", description: "Com batata assada e azeite", why: tr("fallback_s_why") }];
  const mainDefault = [
    { name: "Bacalhau à Brás", description: "Com batata palha e ovos", why: tr("fallback_m_1_why") },
    { name: "Robalo Grelhado", description: "Com legumes da época", why: tr("fallback_m_2_why") },
  ];
  const dessertDefault = [{ name: "Tarte de Limão Merengada", description: "Com merengue tostado", why: tr("fallback_d_why") }];

  if (dishType === "wine" || dishType === "beverage") {
    return {
      wines: [],
      starters: starterDefault,
      mains: mainDefault,
      desserts: dessertDefault,
      reasoning: tr("fallback_r_wine"),
    };
  }

  if (dishType === "starter") {
    return {
      wines: isSeafood ? winesSeafood : winesDefault,
      starters: [],
      mains: mainDefault,
      desserts: dessertDefault,
      reasoning: tr("fallback_r_starter"),
    };
  }

  if (dishType === "dessert") {
    return {
      wines: [{ name: "Niepoort 10 Anos Tawny", description: "Porto", why: tr("fallback_wd_why") }],
      starters: starterDefault,
      mains: mainDefault,
      desserts: [],
      reasoning: tr("fallback_r_dessert"),
    };
  }

  // main or other
  return {
    wines: isSeafood ? winesSeafood : isMeat ? winesMeat : winesDefault,
    starters: starterDefault,
    mains: [],
    desserts: dessertDefault,
    reasoning: isSeafood ? tr("fallback_r_seafood") : isMeat ? tr("fallback_r_meat") : tr("fallback_r_default"),
  };
}

export function DishDetailSheet({ dish, categories, onClose }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "ai">("info");
  const [imgError, setImgError] = useState(false);
  const { tr, locale } = useLanguage();

  const dishType: DishType = dish
    ? getCategoryType(categories.find((c) => c.id === dish.category_id)?.name ?? "")
    : "other";

  // Manual pairings take priority — convert to AIRecommendation shape
  const manualRec: AIRecommendation | null = dish?.manual_pairings &&
    Object.values(dish.manual_pairings).some((arr) => arr.length > 0)
    ? { ...dish.manual_pairings, reasoning: "" }
    : null;

  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragCurrentY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    if (dish) {
      setIsVisible(true);
      setAiRec(null);
      setLoadingAI(false);
      setActiveTab("info");
      setImgError(false);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [dish]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 320);
  }, [onClose]);

  const fetchAIRecommendations = useCallback(async () => {
    if (!dish || loadingAI) return;
    setLoadingAI(true);
    setActiveTab("ai");
    track("ai_pairing", dish.restaurant_id, dish.id);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dish, dishType, locale }),
      });
      const data = await res.json();
      if (data.error) throw new Error("No data");
      setAiRec({
        wines: Array.isArray(data.wines) ? data.wines : [],
        starters: Array.isArray(data.starters) ? data.starters : [],
        mains: Array.isArray(data.mains) ? data.mains : [],
        desserts: Array.isArray(data.desserts) ? data.desserts : [],
        reasoning: data.reasoning ?? "",
      });
    } catch {
      setAiRec(getFallbackForDish(dish, dishType, tr));
    } finally {
      setLoadingAI(false);
    }
  }, [dish, dishType, locale, loadingAI, tr]);

  const handleAITabClick = useCallback(() => {
    if (manualRec) {
      setActiveTab("ai");
      return;
    }
    if (loadingAI) return;
    if (!aiRec) {
      fetchAIRecommendations();
    } else {
      setActiveTab("ai");
    }
  }, [manualRec, aiRec, loadingAI, fetchAIRecommendations]);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragCurrentY.current = e.touches[0].clientY;
    isDragging.current = true;
    if (sheetRef.current) {
      sheetRef.current.style.transition = "none";
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    dragCurrentY.current = e.touches[0].clientY;
    const diff = dragCurrentY.current - dragStartY.current;
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    const diff = dragCurrentY.current - dragStartY.current;
    if (sheetRef.current) {
      sheetRef.current.style.transition = "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)";
    }
    if (diff > 120) {
      handleClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = "";
    }
  };

  if (!dish) return null;

  const dishName = getLocalized(dish, locale, "name");
  const dishDescription = getLocalized(dish, locale, "description");
  const hasNutrition = dish.calories != null || dish.proteins != null || dish.carbs != null || dish.fat != null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      <div
        ref={sheetRef}
        className={`fixed z-50 flex flex-col bg-[#1a1916]
          bottom-0 left-0 right-0 max-h-[92dvh] rounded-t-3xl border-t border-white/[0.08]
          sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[440px] sm:max-h-none sm:rounded-none sm:rounded-l-3xl sm:border-t-0 sm:border-l sm:border-white/[0.08]
          ${isVisible ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"}
        `}
        style={{ transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)" }}
      >
        {/* Drag handle — mobile only */}
        <div
          className="flex flex-col items-center pt-3 pb-1 flex-shrink-0 touch-none select-none sm:hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="overflow-y-auto flex-1 overscroll-contain">
          {/* Hero image */}
          <div className="relative mx-4 rounded-2xl overflow-hidden mb-4 bg-[#2a2926] h-44 sm:h-52">
            {dish.image_url && !imgError ? (
              <Image
                src={dish.image_url}
                alt={dishName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
                priority
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🍽️</div>
            )}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
              aria-label={tr("close")}
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Header */}
          <div className="px-4 mb-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif text-[#f5f5f0] text-2xl font-semibold leading-tight flex-1">
                {dishName}
              </h2>
              <span className="font-bold text-xl whitespace-nowrap" style={{ color: "var(--accent, #e6a81e)" }}>
                {dish.price.toFixed(2)} €
              </span>
            </div>
            <p className="text-[#96967f] text-sm leading-relaxed mt-2">{dishDescription}</p>

            {dish.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {dish.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-0.5 rounded-full"
                  style={{ background: "color-mix(in srgb, var(--accent, #e6a81e) 10%, transparent)", color: "var(--accent, #e6a81e)", border: "1px solid color-mix(in srgb, var(--accent, #e6a81e) 20%, transparent)" }}
                  >
                    {translateTag(tag, tr)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Pairing CTA — manual or AI */}
          <div className="px-4 mb-4">
            {manualRec ? (
              /* Manual pairings available — show prominent button */
              <button
                onClick={() => setActiveTab("ai")}
                className="w-full flex items-center gap-3 active:scale-[0.98] transition-transform rounded-2xl p-4"
                style={{
                  background: "linear-gradient(135deg, rgba(126,184,164,0.14) 0%, rgba(126,184,164,0.05) 100%)",
                  border: "1px solid rgba(126,184,164,0.28)",
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(126,184,164,0.16)" }}>
                  <Sparkles className="w-5 h-5" style={{ color: "#7eb8a4" }} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#e8e8e0]">{tr("ai_cta_idle")}</p>
                  <p className="text-xs mt-0.5 text-[#626250]">{tr("manual_sub")}</p>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${activeTab === "ai" ? "rotate-180" : ""}`} style={{ color: "rgba(126,184,164,0.6)" }} />
              </button>
            ) : (
              /* No manual pairings — AI button */
              <button
                onClick={aiRec ? () => setActiveTab("ai") : fetchAIRecommendations}
                disabled={loadingAI}
                className="w-full flex items-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-70 rounded-2xl p-4"
                style={{
                  background: "linear-gradient(135deg, rgba(230,168,30,0.14) 0%, rgba(230,168,30,0.05) 100%)",
                  border: "1px solid rgba(230,168,30,0.28)",
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(230,168,30,0.16)" }}>
                  {loadingAI
                    ? <span className="w-5 h-5 border-2 border-[#e6a81e]/30 border-t-[#e6a81e] rounded-full animate-spin" />
                    : <Sparkles className="w-5 h-5 text-[#e6a81e]" />}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#e8e8e0]">
                    {loadingAI ? tr("ai_loading") : aiRec ? tr("ai_cta_done") : tr("ai_cta_idle")}
                  </p>
                  <p className="text-xs mt-0.5 text-[#626250]">
                    {aiRec ? tr("ai_sub_after") : tr("ai_sub_before")}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#e6a81e]/60 transition-transform flex-shrink-0 ${activeTab === "ai" ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="px-4">
            <div className="flex border-b border-white/[0.08] mb-4">
              <button
                onClick={() => setActiveTab("info")}
                className={`pb-3 mr-6 text-sm font-medium transition-colors relative ${
                  activeTab === "info" ? "" : "text-[#7a7a62]"
                }`}
              style={activeTab === "info" ? { color: "var(--accent, #e6a81e)" } : {}}
              >
                {tr("tab_info")}
                {activeTab === "info" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: "var(--accent, #e6a81e)" }} />
                )}
              </button>
              <button
                onClick={handleAITabClick}
                className={`pb-3 text-sm font-medium transition-colors flex items-center gap-1.5 relative ${
                  activeTab === "ai" ? "" : "text-[#7a7a62]"
                }`}
              style={activeTab === "ai" ? { color: "var(--accent, #e6a81e)" } : {}}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {tr("tab_ai")}
                {(aiRec || manualRec) && (
                  <span
                    className="ml-1 w-1.5 h-1.5 rounded-full"
                    style={{ background: manualRec ? "#7eb8a4" : "var(--accent, #e6a81e)" }}
                    title={tr("ai_rec_available")}
                  />
                )}
                {activeTab === "ai" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: "var(--accent, #e6a81e)" }} />
                )}
              </button>
            </div>

            {/* Info tab */}
            {activeTab === "info" && (
              <div className="space-y-5 pb-10 animate-fade-in">
                {hasNutrition && (
                  <div>
                    <h3 className="text-[#d4d4c8] text-xs font-semibold uppercase tracking-widest mb-3">
                      {tr("nutrition")}
                    </h3>
                    <div className="glass-card rounded-xl p-4 space-y-3">
                      {dish.calories != null && (
                        <div className="flex justify-between items-center pb-3 border-b border-white/[0.05]">
                          <span className="text-[#96967f] text-sm">{tr("calories")}</span>
                          <span className="text-[#f5f5f0] font-bold text-lg">
                            {dish.calories}{" "}
                            <span className="text-[#7a7a62] text-sm font-normal">kcal</span>
                          </span>
                        </div>
                      )}
                      {dish.proteins != null && (
                        <NutritionBar label={tr("proteins")} value={dish.proteins} unit="g" max={60} color="bg-blue-400" />
                      )}
                      {dish.carbs != null && (
                        <NutritionBar label={tr("carbs")} value={dish.carbs} unit="g" max={80} color="bg-orange-400" />
                      )}
                      {dish.fat != null && (
                        <NutritionBar label={tr("fat")} value={dish.fat} unit="g" max={50} color="bg-yellow-400" />
                      )}
                    </div>
                  </div>
                )}

                {dish.allergens.length > 0 && (
                  <div>
                    <h3 className="text-[#d4d4c8] text-xs font-semibold uppercase tracking-widest mb-3">
                      {tr("allergens")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {dish.allergens.map((a) => (
                        <AllergenBadge key={a} allergen={a} size="md" />
                      ))}
                    </div>
                  </div>
                )}

                {!hasNutrition && dish.allergens.length === 0 && (
                  <p className="text-[#484640] text-sm text-center py-8">
                    {tr("no_info")}
                  </p>
                )}
              </div>
            )}

            {/* AI tab */}
            {activeTab === "ai" && (() => {
              const activeRec = manualRec ?? aiRec;
              const isManual = !!manualRec;
              const accentColor = isManual ? "#7eb8a4" : "#e6a81e";

              return (
                <div className="pb-10 animate-fade-in">
                  {loadingAI ? (
                    <AILoadingSkeleton
                      analyzing={tr("ai_analyzing")}
                      labels={[tr("ai_wines"), tr("ai_starters"), tr("ai_desserts")]}
                    />
                  ) : activeRec ? (
                    <div className="space-y-6">
                      {/* Header card */}
                      <div
                        className="rounded-2xl p-4"
                        style={{
                          background: `linear-gradient(135deg, ${accentColor}14 0%, ${accentColor}08 100%)`,
                          border: `1px solid ${accentColor}29`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
                          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${accentColor}b3` }}>
                            {isManual ? tr("ai_cta_idle") : tr("ai_sommelier")}
                          </span>
                        </div>
                        <p className="text-[#96967f] text-sm leading-relaxed italic">
                          &ldquo;{activeRec.reasoning || tr("ai_fallback_reasoning")}&rdquo;
                        </p>
                      </div>

                      {activeRec.wines?.length > 0 && dishType !== "wine" && dishType !== "beverage" && (
                        <AISection icon={<Wine className="w-4 h-4" />} title={tr("ai_wines")} whyLabel={tr("ai_why")} accentColor="#e6a81e" items={activeRec.wines} />
                      )}
                      {activeRec.starters?.length > 0 && dishType !== "starter" && (
                        <AISection icon={<Salad className="w-4 h-4" />} title={tr("ai_starters")} whyLabel={tr("ai_why")} accentColor="#7eb8a4" items={activeRec.starters} />
                      )}
                      {activeRec.mains?.length > 0 && dishType !== "main" && dishType !== "other" && (
                        <AISection icon={<UtensilsCrossed className="w-4 h-4" />} title={tr("ai_mains")} whyLabel={tr("ai_why")} accentColor="#9b8ed6" items={activeRec.mains} />
                      )}
                      {activeRec.desserts?.length > 0 && dishType !== "dessert" && (
                        <AISection icon={<Cake className="w-4 h-4" />} title={tr("ai_desserts")} whyLabel={tr("ai_why")} accentColor="#c89b7b" items={activeRec.desserts} />
                      )}

                      {/* Footer actions */}
                      <div className="flex items-center justify-between pt-1">
                        {isManual ? (
                          <button
                            onClick={() => { setAiRec(null); fetchAIRecommendations(); }}
                            className="flex items-center gap-1.5 text-[#626250] text-xs active:opacity-60 transition-opacity"
                          >
                            <Sparkles className="w-3 h-3" />
                            {tr("ai_generate_auto")}
                          </button>
                        ) : (
                          <button
                            onClick={() => { setAiRec(null); fetchAIRecommendations(); }}
                            className="flex items-center gap-1.5 text-[#626250] text-xs active:opacity-60 transition-opacity"
                          >
                            <RefreshCw className="w-3 h-3" />
                            {tr("ai_regenerate")}
                          </button>
                        )}
                        <span className="text-[10px] text-[#3a3a32]">
                          {tr("ai_credit")}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <AIEmptyState
                      onRequest={fetchAIRecommendations}
                      title={tr("ai_empty_title")}
                      desc={tr("ai_empty_desc")}
                      cta={tr("ai_empty_cta")}
                      credit={tr("ai_credit")}
                    />
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </>
  );
}

function AILoadingSkeleton({ analyzing, labels }: { analyzing: string; labels: [string, string, string] }) {
  return (
    <div className="space-y-5">
      <div
        className="rounded-2xl p-4"
        style={{ background: "rgba(230,168,30,0.05)", border: "1px solid rgba(230,168,30,0.1)" }}
      >
        <div className="skeleton h-3 w-24 rounded mb-3" />
        <div className="skeleton h-3 w-full rounded mb-1.5" />
        <div className="skeleton h-3 w-4/5 rounded" />
      </div>

      {labels.map((label, i) => (
        <div key={label} style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="skeleton w-4 h-4 rounded" />
            <div className="skeleton h-2.5 w-28 rounded" />
          </div>
          <div className="space-y-2">
            {[0, 1].map((j) => (
              <div
                key={j}
                className="rounded-xl p-3.5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex gap-3">
                  <div className="skeleton w-7 h-7 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-2.5 w-1/2 rounded" />
                    <div className="skeleton h-2.5 w-full rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="text-center text-[#484640] text-xs pt-1">
        {analyzing}
      </p>
    </div>
  );
}

function AIEmptyState({
  onRequest, title, desc, cta, credit,
}: {
  onRequest: () => void;
  title: string;
  desc: string;
  cta: string;
  credit: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgba(230,168,30,0.12) 0%, rgba(230,168,30,0.04) 100%)",
          border: "1px solid rgba(230,168,30,0.18)",
        }}
      >
        <Sparkles className="w-7 h-7 text-[#e6a81e] opacity-70" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-[#96967f]">{title}</p>
        <p className="text-xs text-[#484640] leading-relaxed px-8">{desc}</p>
      </div>
      <button
        onClick={onRequest}
        className="mt-1 px-5 py-2.5 rounded-full text-sm font-semibold text-[#1a1916] bg-[#e6a81e] active:scale-95 transition-transform"
      >
        {cta}
      </button>
      <span className="text-[10px] text-[#3a3a32]">{credit}</span>
    </div>
  );
}

function AISection({
  icon,
  title,
  whyLabel,
  accentColor,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  whyLabel: string;
  accentColor: string;
  items: { name: string; description: string; why: string }[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div style={{ color: accentColor }}>{icon}</div>
        <h3 className="text-[#d4d4c8] text-xs font-semibold uppercase tracking-widest">{title}</h3>
      </div>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex">
              {/* Left accent bar */}
              <div className="w-1 flex-shrink-0 rounded-l-xl" style={{ background: accentColor, opacity: 0.6 }} />

              <div className="flex-1 p-3.5">
                <div className="flex items-start gap-2.5 mb-2">
                  {/* Number badge */}
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5"
                    style={{ background: `${accentColor}18`, color: accentColor }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[#e8e8e0] font-semibold text-sm leading-tight">{item.name}</h4>
                    <p className="text-[#626250] text-xs mt-0.5">{item.description}</p>
                  </div>
                </div>

                {/* Why section */}
                <div
                  className="rounded-lg px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <p className="text-[#7a7a62] text-xs leading-relaxed">
                    <span style={{ color: accentColor, opacity: 0.7 }} className="font-semibold">{whyLabel} </span>
                    {item.why}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
