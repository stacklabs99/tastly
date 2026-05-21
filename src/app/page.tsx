"use client";

import Link from "next/link";
import { Sparkles, QrCode, BarChart3, ChevronRight } from "lucide-react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/menu/LanguageSwitcher";

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}

function HomeContent() {
  const { tr } = useLanguage();

  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-gold-400" />,
      title: tr("home_feature_ai_title"),
      desc: tr("home_feature_ai_desc"),
    },
    {
      icon: <QrCode className="w-5 h-5 text-gold-400" />,
      title: tr("home_feature_qr_title"),
      desc: tr("home_feature_qr_desc"),
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-gold-400" />,
      title: tr("home_feature_dash_title"),
      desc: tr("home_feature_dash_desc"),
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Language switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span className="text-gold-400 text-sm font-medium">
            {tr("home_badge")}
          </span>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl font-bold text-dark-50 leading-tight mb-6">
          Tastly
        </h1>

        <p className="text-dark-300 text-lg md:text-xl max-w-lg leading-relaxed mb-10">
          {tr("home_tagline")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/menu/casa-do-mar"
            className="flex items-center gap-2 bg-gold-500 text-dark-950 px-6 py-3 rounded-full font-semibold text-sm hover:bg-gold-400 transition-colors"
          >
            {tr("home_demo_btn")}
            <ChevronRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="flex items-center gap-2 border border-white/10 text-dark-200 px-6 py-3 rounded-full text-sm hover:bg-white/5 transition-colors"
          >
            {tr("home_learn_more")}
          </a>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="px-6 pb-20 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="glass-card rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="font-serif text-dark-100 font-semibold mb-1.5">
                {f.title}
              </h3>
              <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
