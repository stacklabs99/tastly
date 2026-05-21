"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Sparkles, QrCode, Globe, LayoutDashboard,
  Star, ChevronRight, Check, Utensils, TrendingUp, Smartphone,
} from "lucide-react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 text-dark-50">

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(26,25,22,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <span className="font-serif text-xl font-bold" style={{ color: "#e6a81e" }}>Tastly</span>
          <div className="flex items-center gap-3">
            <Link
              href="/menu/casa-do-mar"
              target="_blank"
              className="hidden sm:block text-sm font-medium transition-colors"
              style={{ color: "#626250" }}
            >
              Ver demo
            </Link>
            <Link
              href="/menu/casa-do-mar"
              target="_blank"
              className="text-sm font-bold px-4 py-2 rounded-full transition-all active:scale-95"
              style={{ background: "#e6a81e", color: "#1a1916" }}
            >
              Ver demo grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-5 text-center overflow-hidden">
        {/* Glow background */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(230,168,30,0.07) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{ background: "rgba(230,168,30,0.1)", border: "1px solid rgba(230,168,30,0.25)", color: "#e6a81e" }}>
            <Sparkles className="w-3.5 h-3.5" />
            Menu digital com IA · Grátis para começar
          </div>

          <h1 className="font-serif font-bold leading-tight mb-6"
            style={{ fontSize: "clamp(38px, 7vw, 68px)", letterSpacing: "-0.02em" }}>
            O menu que{" "}
            <span className="gold-gradient-text">convence o cliente</span>
            {" "}a pedir mais.
          </h1>

          <p className="text-lg leading-relaxed mb-10 mx-auto" style={{ color: "#7a7a62", maxWidth: 520 }}>
            Menu digital elegante com <strong style={{ color: "#b8b8a8" }}>IA de maridagem</strong>:
            quando o cliente escolhe um prato, o Tastly sugere o vinho, entrada e sobremesa certos.
            O ticket médio sobe. Sem esforço.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/menu/casa-do-mar"
              target="_blank"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-all active:scale-[0.98] hover:brightness-110"
              style={{ background: "#e6a81e", color: "#1a1916" }}
            >
              Ver demo do menu
              <ChevronRight className="w-4 h-4" />
            </Link>
            <a
              href="#precos"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#96967f" }}
            >
              Ver planos e preços
            </a>
          </div>

          <p className="mt-5 text-xs" style={{ color: "#3a3830" }}>
            Sem cartão de crédito. Configurado em 5 minutos.
          </p>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="py-8 px-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { value: "4", label: "idiomas", sub: "PT · EN · ES · FR" },
            { value: "IA", label: "maridagem", sub: "Vinho · Entrada · Sobremesa" },
            { value: "QR", label: "sem app", sub: "Abre direto no telemóvel" },
            { value: "0€", label: "para começar", sub: "Plano gratuito incluído" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-2xl font-bold mb-0.5" style={{ color: "#e6a81e" }}>{s.value}</div>
              <div className="text-sm font-semibold" style={{ color: "#d4d4c8" }}>{s.label}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "#484640" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="py-24 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#626250" }}>Como funciona</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "#f5f5f0" }}>
              Simples para o restaurante.<br />Incrível para o cliente.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Smartphone className="w-6 h-6" />,
                title: "QR code na mesa",
                desc: "O cliente aponta o telemóvel para o QR da mesa ou cartão. Sem app. Sem fricção.",
              },
              {
                step: "02",
                icon: <Utensils className="w-6 h-6" />,
                title: "Menu elegante e rápido",
                desc: "Visual premium, fotos de qualidade, filtros por categoria. Disponível em 4 idiomas automaticamente.",
              },
              {
                step: "03",
                icon: <Sparkles className="w-6 h-6" />,
                title: "IA sugere o complemento ideal",
                desc: "Ao abrir um prato, a IA recomenda o vinho, entrada e sobremesa certos. O cliente pede mais. O ticket sobe.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex items-start gap-4">
                  <div>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 flex-shrink-0"
                      style={{ background: "rgba(230,168,30,0.1)", border: "1px solid rgba(230,168,30,0.2)", color: "#e6a81e" }}
                    >
                      {item.icon}
                    </div>
                    <div className="text-[10px] font-bold tracking-widest mb-2" style={{ color: "#3a3830" }}>{item.step}</div>
                    <h3 className="font-serif text-lg font-semibold mb-2" style={{ color: "#f0efe9" }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#626250" }}>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-5" style={{ background: "rgba(255,255,255,0.015)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#626250" }}>Funcionalidades</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "#f5f5f0" }}>
              Tudo o que o seu restaurante precisa.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Sparkles className="w-5 h-5" />,
                title: "IA de Maridagem",
                desc: "Para cada prato, a IA sugere vinho, entrada e sobremesa. Aumenta o ticket médio sem formação extra da equipa.",
              },
              {
                icon: <Globe className="w-5 h-5" />,
                title: "4 Idiomas Automáticos",
                desc: "PT, EN, ES e FR. O cliente muda o idioma com um toque. Perfeito para restaurantes com turismo.",
              },
              {
                icon: <QrCode className="w-5 h-5" />,
                title: "QR Code Instantâneo",
                desc: "Gere e descarregue o QR code em PNG. Coloque nas mesas, cardápios ou decoração. Pronto a imprimir.",
              },
              {
                icon: <LayoutDashboard className="w-5 h-5" />,
                title: "Admin Completo",
                desc: "Adicione, edite e organize pratos em segundos. Fotos, preços, alergénios e destaque — sem suporte técnico.",
              },
              {
                icon: <Star className="w-5 h-5" />,
                title: "Link de Reviews",
                desc: "QR code e botão diretos para o Google Reviews no final do menu. Mais avaliações, menos esforço.",
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                title: "Design Premium",
                desc: "Visual de restaurante de topo. Fotos grandes, tipografia elegante, fundo escuro que valoriza a comida.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(230,168,30,0.1)", border: "1px solid rgba(230,168,30,0.15)", color: "#e6a81e" }}
                >
                  {f.icon}
                </div>
                <h3 className="font-serif font-semibold mb-2" style={{ color: "#f0efe9", fontSize: 16 }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#626250" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREÇOS ── */}
      <section id="precos" className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#626250" }}>Preços</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "#f5f5f0" }}>
              Comece grátis. Escale quando quiser.
            </h2>
            <p className="mt-4 text-sm" style={{ color: "#626250" }}>
              Sem contratos. Cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* GRÁTIS */}
            <PricingCard
              name="Grátis"
              price="0€"
              period="para sempre"
              desc="Para experimentar e começar."
              cta="Criar menu grátis"
              ctaLink="/menu/casa-do-mar"
              features={[
                "1 restaurante",
                "Até 20 pratos",
                "QR code básico",
                "Menu público",
                "Sem IA",
                "Sem multilingue",
              ]}
            />

            {/* PRO */}
            <PricingCard
              name="Pro"
              price="29€"
              period="por mês"
              desc="Para restaurantes que querem crescer."
              cta="Começar Pro"
              ctaLink="/menu/casa-do-mar"
              highlighted
              badge="Mais popular"
              features={[
                "1 restaurante",
                "Pratos ilimitados",
                "IA de maridagem",
                "4 idiomas (PT/EN/ES/FR)",
                "QR code para download PNG",
                "Link Google Reviews",
                "Fotos por upload",
                "Suporte por email",
              ]}
            />

            {/* BUSINESS */}
            <PricingCard
              name="Business"
              price="79€"
              period="por mês"
              desc="Para grupos e cadeias de restaurantes."
              cta="Falar connosco"
              ctaLink="mailto:hello@tastly.app"
              features={[
                "Restaurantes ilimitados",
                "Tudo do Pro",
                "Domínio personalizado",
                "Analytics avançados",
                "Suporte prioritário",
                "Onboarding dedicado",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-5">
        <div
          className="max-w-3xl mx-auto rounded-3xl p-10 md:p-16 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(230,168,30,0.09) 0%, rgba(230,168,30,0.03) 100%)",
            border: "1px solid rgba(230,168,30,0.18)",
          }}
        >
          <div className="flex justify-center gap-0.5 mb-5">
            {[1,2,3,4,5].map((i) => <span key={i} style={{ fontSize: 20, color: "#e6a81e" }}>★</span>)}
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" style={{ color: "#f5f5f0" }}>
            Crie o menu do seu restaurante hoje.
          </h2>
          <p className="text-base mb-8" style={{ color: "#626250", maxWidth: 440, margin: "0 auto 2rem" }}>
            5 minutos de configuração. Sem cartão de crédito. O seu menu elegante online esta noite.
          </p>
          <Link
            href="/menu/casa-do-mar"
            target="_blank"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold transition-all active:scale-[0.98] hover:brightness-110"
            style={{ background: "#e6a81e", color: "#1a1916" }}
          >
            Ver demo agora
            <ChevronRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-xs" style={{ color: "#3a3830" }}>
            Menu da Casa do Mar — exemplo real de menu Tastly
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-5 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <span className="font-serif text-lg font-bold" style={{ color: "#e6a81e" }}>Tastly</span>
        <p className="text-xs mt-2" style={{ color: "#3a3830" }}>
          © {new Date().getFullYear()} Tastly · Menu digital inteligente para restaurantes
        </p>
      </footer>
    </div>
  );
}

/* ── Pricing Card component ── */
function PricingCard({
  name, price, period, desc, cta, ctaLink, features, highlighted = false, badge,
}: {
  name: string;
  price: string;
  period: string;
  desc: string;
  cta: string;
  ctaLink: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}) {
  return (
    <div
      className="rounded-2xl p-7 flex flex-col relative"
      style={highlighted
        ? { background: "rgba(230,168,30,0.06)", border: "1px solid rgba(230,168,30,0.3)" }
        : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
          style={{ background: "#e6a81e", color: "#1a1916" }}
        >
          {badge}
        </div>
      )}

      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: highlighted ? "#e6a81e" : "#626250" }}>
          {name}
        </p>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="font-serif text-4xl font-bold" style={{ color: "#f5f5f0" }}>{price}</span>
          <span className="text-sm" style={{ color: "#626250" }}>{period}</span>
        </div>
        <p className="text-sm" style={{ color: "#626250" }}>{desc}</p>
      </div>

      <ul className="space-y-2.5 flex-1 mb-8">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "#96967f" }}>
            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: highlighted ? "#e6a81e" : "#626250" }} />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={ctaLink}
        target={ctaLink.startsWith("http") || ctaLink.startsWith("mailto") ? "_blank" : undefined}
        className="w-full py-3 rounded-xl text-sm font-bold text-center transition-all active:scale-[0.98] hover:brightness-110 block"
        style={highlighted
          ? { background: "#e6a81e", color: "#1a1916" }
          : { background: "rgba(255,255,255,0.06)", color: "#b8b8a8", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {cta}
      </Link>
    </div>
  );
}
