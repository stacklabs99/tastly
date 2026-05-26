import { notFound } from "next/navigation";
import { getRestaurantBySlug, getCategoriesForRestaurant, getDishesForRestaurant } from "@/lib/db";
import { ALLERGEN_INFO, type Allergen } from "@/types";
import { PrintButton } from "@/components/menu/PrintButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  return { title: restaurant ? `${restaurant.name} — Menu para impressão` : "Menu" };
}

export default async function PrintMenuPage({ params }: Props) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || !restaurant.is_active) notFound();

  const [categories, dishes] = await Promise.all([
    getCategoriesForRestaurant(restaurant.id),
    getDishesForRestaurant(restaurant.id),
  ]);

  const accent = restaurant.primary_color ?? "#c49516";

  const grouped = [...categories]
    .sort((a, b) => a.position - b.position)
    .map((cat) => ({
      cat,
      items: dishes
        .filter((d) => d.category_id === cat.id && d.is_available)
        .sort((a, b) => a.position - b.position),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div style={{ background: "#fdfcfa", minHeight: "100vh", color: "#1a1916" }}>
      <style>{`
        @page { margin: 16mm; }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .pm-category { break-inside: avoid; }
          .pm-dish { break-inside: avoid; }
        }
      `}</style>

      <PrintButton accent={accent} />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 32px 64px" }}>
        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: 40, paddingBottom: 24, borderBottom: `2px solid ${accent}` }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 38, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>
            {restaurant.name}
          </h1>
          {restaurant.cuisine_type && (
            <p style={{ fontSize: 14, color: "#7a7768", marginTop: 6, textTransform: "uppercase", letterSpacing: 2 }}>
              {restaurant.cuisine_type}
            </p>
          )}
          {restaurant.description && (
            <p style={{ fontSize: 14, color: "#5a5850", marginTop: 10, maxWidth: 520, marginInline: "auto", lineHeight: 1.6 }}>
              {restaurant.description}
            </p>
          )}
          {(restaurant.address || restaurant.phone) && (
            <p style={{ fontSize: 12, color: "#8a8778", marginTop: 12 }}>
              {[restaurant.address, restaurant.phone].filter(Boolean).join("  ·  ")}
            </p>
          )}
        </header>

        {/* Categories */}
        {grouped.map(({ cat, items }) => (
          <section key={cat.id} className="pm-category" style={{ marginBottom: 36 }}>
            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 22,
                fontWeight: 700,
                color: accent,
                marginBottom: 4,
                borderBottom: "1px solid #e8e4da",
                paddingBottom: 6,
              }}
            >
              {cat.name}
            </h2>
            {cat.description && (
              <p style={{ fontSize: 12, color: "#8a8778", marginTop: 0, marginBottom: 14, fontStyle: "italic" }}>
                {cat.description}
              </p>
            )}

            <div style={{ marginTop: 14 }}>
              {items.map((dish) => (
                <div key={dish.id} className="pm-dish" style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{dish.name}</span>
                    <span style={{ flex: 1, borderBottom: "1px dotted #cfcabb", transform: "translateY(-3px)" }} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: accent, whiteSpace: "nowrap" }}>
                      {dish.price.toFixed(2)} €
                    </span>
                  </div>
                  {dish.description && (
                    <p style={{ fontSize: 13, color: "#6a6858", margin: "3px 0 0", lineHeight: 1.5, maxWidth: 600 }}>
                      {dish.description}
                    </p>
                  )}
                  {dish.allergens.length > 0 && (
                    <p style={{ fontSize: 11, color: "#9a9788", marginTop: 3 }}>
                      {dish.allergens.map((a) => ALLERGEN_INFO[a as Allergen]?.label).filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {grouped.length === 0 && (
          <p style={{ textAlign: "center", color: "#8a8778", padding: "48px 0" }}>
            Este menu ainda não tem pratos disponíveis.
          </p>
        )}

        {/* Footer */}
        <footer style={{ textAlign: "center", marginTop: 48, paddingTop: 20, borderTop: "1px solid #e8e4da" }}>
          <p style={{ fontSize: 11, color: "#a8a598" }}>Menu gerado por Tastly · tastly.stacklabs.pt</p>
        </footer>
      </div>
    </div>
  );
}
