"use client";

import { useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { Download, ExternalLink, QrCode } from "lucide-react";

const SIZES = [
  { label: "Pequeno", value: 200, desc: "Cartão de mesa" },
  { label: "Médio", value: 400, desc: "Flyer / Menu impresso" },
  { label: "Grande", value: 800, desc: "Poster / Quadro" },
];

export default function QrCodePage() {
  const { restaurant } = useAdmin();
  const [size, setSize] = useState(400);

  const menuUrl = typeof window !== "undefined"
    ? `${window.location.origin}/menu/${restaurant.slug}`
    : `https://tastly.app/menu/${restaurant.slug}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&bgcolor=1a1916&color=e6a81e&margin=20&data=${encodeURIComponent(menuUrl)}`;

  const handleDownload = async () => {
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode-${restaurant.slug}-${size}px.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(qrUrl, "_blank");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold" style={{ color: "#f5f5f0" }}>QR Code do Menu</h1>
        <p className="text-sm mt-1" style={{ color: "#626250" }}>
          Gera e descarrega o QR code para colocar nas mesas, menus impressos ou decoração.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Preview */}
        <div
          className="rounded-2xl p-8 flex flex-col items-center gap-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#1a1916", border: "2px solid rgba(230,168,30,0.2)", padding: 16 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="QR Code do menu"
              width={180}
              height={180}
              style={{ display: "block" }}
            />
          </div>
          <div className="text-center">
            <p className="font-serif font-semibold text-sm" style={{ color: "#f0efe9" }}>{restaurant.name}</p>
            <p className="text-[11px] mt-0.5" style={{ color: "#484640" }}>Aponte para abrir o menu</p>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5">

          {/* URL */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#4a4a3a" }}>
              Link do menu
            </label>
            <div
              className="flex items-center rounded-xl px-3 py-2.5 gap-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-xs flex-1 truncate" style={{ color: "#7a7a62" }}>{menuUrl}</span>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 transition-colors hover:text-[#e6a81e]"
                style={{ color: "#484640" }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Size selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#4a4a3a" }}>
              Tamanho para download
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SIZES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSize(s.value)}
                  className="rounded-xl p-2.5 text-center transition-all"
                  style={size === s.value
                    ? { background: "rgba(230,168,30,0.12)", border: "1px solid rgba(230,168,30,0.3)", color: "#e6a81e" }
                    : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#626250" }}
                >
                  <p className="text-xs font-bold">{s.label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: size === s.value ? "#b8950a" : "#3a3830" }}>{s.value}px</p>
                  <p className="text-[10px]" style={{ color: size === s.value ? "#a07a0a" : "#2a2820" }}>{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] hover:brightness-110"
            style={{ background: "#e6a81e", color: "#1a1916" }}
          >
            <Download className="w-4 h-4" />
            Descarregar PNG ({size}px)
          </button>

          <p className="text-[11px] leading-relaxed" style={{ color: "#3a3830" }}>
            O ficheiro PNG inclui fundo escuro e QR em dourado — pronto para imprimir ou usar digitalmente.
          </p>
        </div>
      </div>

      {/* Tips */}
      <div
        className="mt-8 rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <QrCode className="w-4 h-4" style={{ color: "#626250" }} />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4a4a3a" }}>Dicas de utilização</p>
        </div>
        <ul className="space-y-1.5">
          {[
            "Mesa: tamanho Pequeno (200px) num cartão plastificado ao lado do saleiro.",
            "Menu impresso: tamanho Médio (400px) na capa ou contracapa.",
            "Entrada do restaurante / Instagram: tamanho Grande (800px).",
            "Se imprimir em fundo branco, use uma versão com fundo claro — fale connosco.",
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: "#484640" }}>
              <span style={{ color: "#3a3830", flexShrink: 0 }}>·</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
