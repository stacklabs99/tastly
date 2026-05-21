"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Sparkles, QrCode, Globe, Star,
  ChevronRight, Check, TrendingUp, Smartphone, ArrowRight,
} from "lucide-react";

/* ── Scroll hook ── */
function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

export default function Home() {
  const scrolled = useScrolled();

  return (
    <div className="min-h-screen text-dark-50" style={{ background: "#13120f" }}>

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(19,18,15,0.94)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold" style={{ color: "#e6a81e" }}>Tastly</span>
            <span
              className="hidden sm:block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
              style={{ background: "rgba(230,168,30,0.1)", color: "#e6a81e" }}
            >
              Beta
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#precos" className="hidden sm:block text-sm transition-colors" style={{ color: "#626250" }}>
              Preços
            </a>
            <Link
              href="/menu/casa-do-mar"
              target="_blank"
              className="text-sm font-bold px-5 py-2 rounded-full transition-all active:scale-95 hover:brightness-110"
              style={{ background: "#e6a81e", color: "#1a1916" }}
            >
              Ver demo
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 px-5 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{
            position: "absolute", top: "-10%", left: "50%", transform: "translateX(-20%)",
            width: 900, height: 600,
            background: "radial-gradient(ellipse, rgba(230,168,30,0.06) 0%, transparent 65%)",
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: copy */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-7"
                style={{ background: "rgba(230,168,30,0.1)", border: "1px solid rgba(230,168,30,0.2)", color: "#e6a81e" }}
              >
                <Sparkles className="w-3 h-3" />
                Menu digital com IA · Sem app · A partir de 39€/mês
              </div>

              <h1
                className="font-serif font-bold leading-[1.05] mb-5"
                style={{ fontSize: "clamp(36px, 5.5vw, 58px)", letterSpacing: "-0.025em", color: "#f5f5f0" }}
              >
                O menu que{" "}
                <span className="gold-gradient-text">vende</span>
                {" "}por si.
              </h1>

              <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: "#7a7a62", maxWidth: 460 }}>
                Menu digital elegante com <span style={{ color: "#b8b8a8", fontWeight: 600 }}>IA de maridagem</span>:
                quando o cliente abre um prato, o Tastly sugere o vinho, entrada e sobremesa certos —
                e o ticket médio sobe.
              </p>

              {/* Pain points */}
              <div className="space-y-2 mb-8">
                {[
                  "Chega de menus em papel desatualizados ou sujos",
                  "Os turistas mudam de idioma sem precisar de ajuda",
                  "Sem app para instalar. Um QR code é suficiente",
                ].map((p) => (
                  <div key={p} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ background: "rgba(230,168,30,0.15)" }}>
                      <Check className="w-2.5 h-2.5" style={{ color: "#e6a81e" }} />
                    </div>
                    <span className="text-sm" style={{ color: "#7a7a62" }}>{p}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/menu/casa-do-mar"
                  target="_blank"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-all active:scale-[0.98] hover:brightness-110"
                  style={{ background: "#e6a81e", color: "#1a1916" }}
                >
                  Ver demo a funcionar
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#precos"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium transition-all hover:bg-white/5"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#626250" }}
                >
                  Ver preços
                </a>
              </div>

              <p className="mt-4 text-xs" style={{ color: "#3a3830" }}>
                Configurado em 5 minutos · Sem contrato · Cancela quando quiser
              </p>
            </div>

            {/* Right: menu mockup */}
            <div className="flex justify-center lg:justify-end">
              <MenuMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="py-10 px-5" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "4", label: "Idiomas", sub: "PT · EN · ES · FR" },
            { value: "IA", label: "Maridagem", sub: "Vinho · Entrada · Sobremesa" },
            { value: "QR", label: "Sem app", sub: "Abre direto no telemóvel" },
            { value: "39€", label: "Para começar", sub: "Plano Starter / mês" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-serif text-2xl font-bold mb-0.5" style={{ color: "#e6a81e" }}>{s.value}</div>
              <div className="text-sm font-semibold" style={{ color: "#d4d4c8" }}>{s.label}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "#484640" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PORQUE O TASTLY ── */}
      <section className="py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-bold" style={{ color: "#f5f5f0" }}>
              Porque é que os restaurantes escolhem o Tastly?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: "📈",
                title: "Ticket médio mais alto",
                desc: "A IA sugere vinho, entrada e sobremesa para cada prato. O cliente pede mais sem que ninguém precise de perguntar.",
              },
              {
                icon: "🌍",
                title: "Turistas sem barreiras",
                desc: "O menu muda de idioma com um toque. PT, EN, ES e FR disponíveis de imediato, sem tradução manual.",
              },
              {
                icon: "⚡",
                title: "Atualizado em segundos",
                desc: "Mudou um preço? Esgotou um prato? Altera no admin e o menu atualiza instantaneamente para todos os clientes.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-6 flex flex-col gap-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <h3 className="font-serif font-semibold" style={{ color: "#f0efe9", fontSize: 16 }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#626250" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="py-20 px-5" style={{ background: "rgba(255,255,255,0.012)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#484640" }}>Como funciona</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "#f5f5f0" }}>
              Do QR code ao upsell em segundos.
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px" style={{ background: "rgba(230,168,30,0.15)" }} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  n: "1",
                  icon: <QrCode className="w-5 h-5" />,
                  title: "QR code na mesa",
                  desc: "O cliente aponta o telemóvel. Sem app. Sem fricção. Abre instantaneamente.",
                },
                {
                  n: "2",
                  icon: <Smartphone className="w-5 h-5" />,
                  title: "Menu elegante e rápido",
                  desc: "Visual premium com fotos, preços e alergénios. Disponível em PT, EN, ES e FR.",
                },
                {
                  n: "3",
                  icon: <TrendingUp className="w-5 h-5" />,
                  title: "IA sugere. Ticket sobe.",
                  desc: "Ao abrir um prato, a IA recomenda vinho, entrada e sobremesa. Sem esforço da equipa.",
                },
              ].map((step) => (
                <div key={step.n} className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center relative z-10"
                    style={{ background: "#13120f", border: "1px solid rgba(230,168,30,0.25)", color: "#e6a81e" }}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#3a3830" }}>
                      Passo {step.n}
                    </p>
                    <h3 className="font-serif text-lg font-semibold mb-1.5" style={{ color: "#f0efe9" }}>{step.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#626250" }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#484640" }}>Funcionalidades</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "#f5f5f0" }}>
              Tudo o que o seu restaurante precisa.
            </h2>
            <p className="mt-4 text-sm" style={{ color: "#626250" }}>
              Sem complicações técnicas. Sem mensalidades escondidas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Sparkles className="w-5 h-5" />,
                title: "IA de Maridagem",
                desc: "Para cada prato, a IA sugere vinho, entrada e sobremesa. O upsell acontece sem o empregado ter de dizer nada.",
                highlight: true,
              },
              {
                icon: <Globe className="w-5 h-5" />,
                title: "4 Idiomas Automáticos",
                desc: "PT, EN, ES e FR. O cliente muda com um toque. Perfeito para restaurantes em zonas turísticas.",
              },
              {
                icon: <QrCode className="w-5 h-5" />,
                title: "QR Code para Download",
                desc: "Gere e descarregue o QR code em PNG com o seu tamanho preferido. Mesa, flyer ou poster.",
              },
              {
                icon: <Star className="w-5 h-5" />,
                title: "Google Reviews no menu",
                desc: "Link e QR code diretos para o Google Reviews no final do menu. Mais avaliações, menos esforço.",
              },
              {
                icon: <Smartphone className="w-5 h-5" />,
                title: "Admin em tempo real",
                desc: "Muda um preço, adiciona um prato, tira do menu. As alterações aparecem no instante seguinte.",
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                title: "Design premium incluído",
                desc: "Visual de restaurante de topo — fundo escuro, tipografia elegante, fotos que valorizam a comida.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6"
                style={f.highlight
                  ? { background: "rgba(230,168,30,0.05)", border: "1px solid rgba(230,168,30,0.18)" }
                  : { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(230,168,30,0.1)", border: "1px solid rgba(230,168,30,0.15)", color: "#e6a81e" }}
                >
                  {f.icon}
                </div>
                <h3 className="font-serif font-semibold mb-2" style={{ color: "#f0efe9", fontSize: 15 }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#626250" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREÇOS ── */}
      <section id="precos" className="py-20 px-5" style={{ background: "rgba(255,255,255,0.012)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#484640" }}>Preços</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "#f5f5f0" }}>
              Simples. Transparente. Sem surpresas.
            </h2>
            <p className="mt-3 text-sm" style={{ color: "#626250" }}>
              Dois planos. Sem custos escondidos. Cancela quando quiseres.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* STARTER */}
            <div
              className="rounded-2xl p-8 flex flex-col"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#626250" }}>Starter</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-serif text-5xl font-bold" style={{ color: "#f5f5f0" }}>39€</span>
                <span className="text-sm" style={{ color: "#626250" }}>/mês</span>
              </div>
              <p className="text-sm mb-6" style={{ color: "#484640" }}>Cancela quando quiser</p>

              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "1 restaurante",
                  "Até 50 pratos",
                  "IA de maridagem",
                  "4 idiomas (PT/EN/ES/FR)",
                  "QR code PNG para download",
                  "Link Google Reviews no menu",
                  "Upload de fotos",
                  "Suporte por email",
                ].map((text) => (
                  <li key={text} className="flex items-center gap-2.5 text-sm" style={{ color: "#7a7a62" }}>
                    <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#626250" }} />
                    {text}
                  </li>
                ))}
              </ul>

              <Link
                href="/menu/casa-do-mar"
                target="_blank"
                className="w-full py-3 rounded-xl text-sm font-bold text-center transition-all hover:bg-white/10 block"
                style={{ background: "rgba(255,255,255,0.06)", color: "#96967f", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Começar Starter — 39€/mês
              </Link>
            </div>

            {/* PRO */}
            <div
              className="rounded-2xl p-8 flex flex-col relative"
              style={{ background: "rgba(230,168,30,0.05)", border: "1px solid rgba(230,168,30,0.28)" }}
            >
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ background: "#e6a81e", color: "#1a1916" }}
              >
                Mais popular
              </div>

              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#e6a81e" }}>Pro</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-serif text-5xl font-bold" style={{ color: "#f5f5f0" }}>69€</span>
                <span className="text-sm" style={{ color: "#626250" }}>/mês</span>
              </div>
              <p className="text-sm mb-6" style={{ color: "#484640" }}>Cancela quando quiser</p>

              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Tudo do Starter",
                  "Pratos ilimitados",
                  "Categorias ilimitadas",
                  "Múltiplos utilizadores admin",
                  "Analytics de pratos",
                  "Suporte prioritário",
                ].map((text) => (
                  <li key={text} className="flex items-center gap-2.5 text-sm" style={{ color: "#96967f" }}>
                    <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#e6a81e" }} />
                    {text}
                  </li>
                ))}
              </ul>

              <Link
                href="/menu/casa-do-mar"
                target="_blank"
                className="w-full py-3.5 rounded-xl text-sm font-bold text-center transition-all hover:brightness-110 active:scale-[0.98] block"
                style={{ background: "#e6a81e", color: "#1a1916" }}
              >
                Começar Pro — 69€/mês
              </Link>

              <p className="text-center text-xs mt-3" style={{ color: "#3a3830" }}>Sem contrato · Cancela quando quiser</p>
            </div>
          </div>

          {/* Enterprise note */}
          <p className="text-center text-sm mt-8" style={{ color: "#484640" }}>
            Grupo de restaurantes?{" "}
            <a href="mailto:hello@tastly.app" className="underline transition-colors hover:text-[#e6a81e]" style={{ color: "#626250" }}>
              Fale connosco
            </a>{" "}
            para plano personalizado.
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-5">
        <div
          className="max-w-2xl mx-auto rounded-3xl px-8 py-14 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(230,168,30,0.08) 0%, rgba(230,168,30,0.02) 100%)",
            border: "1px solid rgba(230,168,30,0.18)",
          }}
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" style={{ color: "#f5f5f0" }}>
            O seu menu merece melhor.
          </h2>
          <p className="text-base mb-8 leading-relaxed" style={{ color: "#626250" }}>
            Crie o menu do seu restaurante hoje. Sem complicações.
          </p>
          <Link
            href="/menu/casa-do-mar"
            target="_blank"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold transition-all active:scale-[0.98] hover:brightness-110"
            style={{ background: "#e6a81e", color: "#1a1916" }}
          >
            Ver demo do menu agora
            <ChevronRight className="w-4 h-4" />
          </Link>
          <p className="mt-5 text-xs" style={{ color: "#2a2820" }}>
            Está a ver o menu do Casa do Mar — exemplo real construído com o Tastly
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-5" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold" style={{ color: "#e6a81e" }}>Tastly</span>
            <span className="text-xs" style={{ color: "#2a2820" }}>Menu digital inteligente</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="mailto:hello@tastly.app" className="text-xs transition-colors hover:text-dark-300" style={{ color: "#3a3830" }}>hello@tastly.app</a>
            <Link href="/menu/casa-do-mar" target="_blank" className="text-xs transition-colors hover:text-dark-300" style={{ color: "#3a3830" }}>Demo</Link>
          </div>
          <p className="text-xs" style={{ color: "#2a2820" }}>© {new Date().getFullYear()} Tastly</p>
        </div>
      </footer>
    </div>
  );
}

/* ── Menu Mockup component ── */
function MenuMockup() {
  return (
    <div className="relative" style={{ perspective: "1000px" }}>
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          boxShadow: "0 0 80px rgba(230,168,30,0.12), 0 40px 80px rgba(0,0,0,0.6)",
          borderRadius: 28,
        }}
      />

      {/* Phone frame */}
      <div
        className="relative overflow-hidden"
        style={{
          width: 280,
          height: 520,
          borderRadius: 28,
          background: "#0e0d0b",
          border: "1.5px solid rgba(255,255,255,0.1)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2" style={{ background: "#0e0d0b" }}>
          <span style={{ fontSize: 10, color: "#3a3830" }}>9:41</span>
          <div className="flex gap-1 items-center">
            {[4,3,2].map(h => <div key={h} className="rounded-sm" style={{ width: 3, height: h * 2, background: "#3a3830" }} />)}
            <div className="rounded-sm ml-1" style={{ width: 14, height: 7, background: "#3a3830", border: "1px solid #3a3830" }} />
          </div>
        </div>

        {/* Cover image area */}
        <div
          className="relative mx-2 rounded-2xl overflow-hidden"
          style={{ height: 130, background: "linear-gradient(135deg, #2a1f0a 0%, #1a1510 100%)" }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(160deg, rgba(230,168,30,0.15) 0%, transparent 60%, rgba(14,13,11,0.8) 100%)" }}
          />
          {/* Restaurant name */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="text-[8px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(230,168,30,0.7)" }}>
              Mariscos · Atlântico
            </div>
            <div className="font-serif font-bold" style={{ color: "#f5f5f0", fontSize: 17, letterSpacing: "-0.02em" }}>
              Casa do Mar
            </div>
          </div>
          {/* Cuisine chip */}
          <div className="absolute top-2.5 left-2.5">
            <span
              className="text-[8px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ background: "rgba(26,25,22,0.7)", color: "#e6a81e", border: "1px solid rgba(230,168,30,0.3)" }}
            >
              Atlântica
            </span>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-3 py-2.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {["Entradas", "Peixes", "Sobremesas"].map((tab, i) => (
            <div
              key={tab}
              className="flex-shrink-0 px-2.5 py-1 rounded-full text-[9px] font-semibold"
              style={i === 0
                ? { background: "#e6a81e", color: "#1a1916" }
                : { background: "rgba(255,255,255,0.05)", color: "#626250" }}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Chef's picks label */}
        <div className="flex items-center gap-2 px-3 mb-2">
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
          <span className="text-[8px] font-semibold uppercase tracking-widest" style={{ color: "#626250" }}>Sugestões do Chefe</span>
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Featured card */}
        <div className="mx-3 mb-2.5 rounded-xl overflow-hidden relative" style={{ height: 80, background: "linear-gradient(135deg, #1e1a12 0%, #151410 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(14,13,11,0.3) 0%, transparent 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <div className="font-serif font-semibold" style={{ color: "#f0efe9", fontSize: 11 }}>Bacalhau à Brás</div>
            <div className="text-[8px] mt-0.5 line-clamp-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Bacalhau desfiado, batata palha, ovos mexidos
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg" style={{ background: "rgba(26,25,22,0.8)", color: "#e6a81e" }}>18,50 €</span>
          </div>
        </div>

        {/* Mini dish cards */}
        <div className="grid grid-cols-2 gap-1.5 px-3">
          {[
            { name: "Amêijoas à Bulhão Pato", price: "16,00 €" },
            { name: "Polvo à Lagareiro", price: "22,00 €" },
          ].map((dish) => (
            <div
              key={dish.name}
              className="rounded-xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="w-full" style={{ height: 40, background: "linear-gradient(135deg, #1e1b14, #141210)" }} />
              <div className="p-1.5">
                <div className="font-serif text-[8px] font-semibold line-clamp-1 mb-0.5" style={{ color: "#e8e8e0" }}>{dish.name}</div>
                <div className="text-[8px] font-bold" style={{ color: "#e6a81e" }}>{dish.price}</div>
              </div>
            </div>
          ))}
        </div>

        {/* AI suggestion hint at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-2"
          style={{ background: "linear-gradient(to top, #0e0d0b 60%, transparent)" }}
        >
          <div
            className="w-full py-2 rounded-xl text-center text-[9px] font-bold flex items-center justify-center gap-1.5"
            style={{ background: "rgba(230,168,30,0.15)", color: "#e6a81e", border: "1px solid rgba(230,168,30,0.2)" }}
          >
            <Sparkles className="w-2.5 h-2.5" />
            Sugestão da Casa — Vinho · Entrada · Sobremesa
          </div>
        </div>
      </div>
    </div>
  );
}
