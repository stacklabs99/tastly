"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Eye, UtensilsCrossed, Sparkles, TrendingUp, Clock, Trophy } from "lucide-react";
import { getAnalytics, type AnalyticsData } from "@/actions/analytics";

const PERIODS = [
  { label: "7 dias", value: 7 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
];

const card = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" };

export default function AnalyticsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    // Sync resets before an async fetch — standard loading pattern. The state
    // setters fire once per slug/days change, not in a render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(false);
    getAnalytics(slug, days)
      .then((d) => { if (active) { setData(d); setLoading(false); } })
      .catch(() => { if (active) { setError(true); setLoading(false); } });
    return () => { active = false; };
  }, [slug, days]);

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl font-bold" style={{ color: "#f5f5f0" }}>Analytics</h1>
          <p className="text-sm mt-1" style={{ color: "#626250" }}>
            O que os teus clientes olham no menu — atualizado em tempo real.
          </p>
        </div>
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setDays(p.value)}
              className="px-4 py-2 text-xs font-semibold transition-all"
              style={days === p.value
                ? { background: "rgba(230,168,30,0.15)", color: "#e6a81e" }
                : { background: "rgba(255,255,255,0.03)", color: "#626250" }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <Skeleton />}

      {error && (
        <div className="rounded-2xl p-8 text-center" style={card}>
          <p className="text-sm" style={{ color: "#e67e4b" }}>Erro ao carregar analytics. Tenta novamente.</p>
        </div>
      )}

      {!loading && !error && data && (
        data.menuViews + data.dishViews + data.aiRequests === 0 ? (
          <EmptyState days={data.days} />
        ) : (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Stat icon={Eye} color="#7eb8a4" bg="rgba(126,184,164,0.1)" label="Visualizações de menu" value={data.menuViews} />
              <Stat icon={UtensilsCrossed} color="#e6a81e" bg="rgba(230,168,30,0.1)" label="Pratos vistos" value={data.dishViews} />
              <Stat icon={Sparkles} color="#9b8ed6" bg="rgba(155,142,214,0.1)" label="Pedidos de maridagem IA" value={data.aiRequests} />
            </div>

            {/* Views over time */}
            <Section icon={TrendingUp} title="Visualizações ao longo do tempo">
              <DayChart data={data.viewsByDay} />
            </Section>

            {/* Top dishes */}
            <Section icon={Trophy} title="Pratos mais vistos">
              {data.topDishes.length === 0
                ? <Empty>Ainda sem visualizações de pratos.</Empty>
                : <RankBars items={data.topDishes.map((d) => ({ label: d.name, value: d.views }))} suffix="visualizações" color="#e6a81e" />}
            </Section>

            {/* Peak hours */}
            <Section icon={Clock} title="Horas de pico">
              <HourChart data={data.peakHours} />
            </Section>

            {/* AI by dish */}
            <Section icon={Sparkles} title="Maridagens IA por prato">
              {data.aiByDish.length === 0
                ? <Empty>Ainda sem pedidos de maridagem.</Empty>
                : <RankBars items={data.aiByDish.map((d) => ({ label: d.name, value: d.count }))} suffix="pedidos" color="#9b8ed6" />}
            </Section>
          </div>
        )
      )}
    </div>
  );
}

/* ─── Pieces ─────────────────────────────────────────────── */

function Stat({ icon: Icon, color, bg, label, value }: { icon: React.ElementType; color: string; bg: string; label: string; value: number }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={card}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bg }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none" style={{ color }}>{value.toLocaleString("pt-PT")}</p>
        <p className="text-[11px] font-medium mt-1" style={{ color: "#e8e8e0" }}>{label}</p>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={card}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4" style={{ color: "#626250" }} />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4a4a3a" }}>{title}</p>
      </div>
      {children}
    </div>
  );
}

function DayChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  // Show ~ every Nth label to avoid clutter
  const step = data.length > 30 ? 10 : data.length > 10 ? 5 : 1;
  return (
    <div>
      <div className="flex items-end gap-[2px] h-32">
        {data.map((d, i) => (
          <div key={d.date} className="flex-1 flex flex-col justify-end group relative" style={{ minWidth: 2 }}>
            <div
              className="rounded-t transition-all"
              style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 2 : 0, background: "#e6a81e", opacity: 0.85 }}
              title={`${d.date}: ${d.count}`}
            />
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{ color: "#e6a81e" }}>
              {d.count}
            </span>
            {i % step === 0 && (
              <span className="text-[8px] mt-1 text-center" style={{ color: "#484640" }}>{d.date.slice(5)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HourChart({ data }: { data: { hour: number; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-[3px] h-28">
      {data.map((d) => (
        <div key={d.hour} className="flex-1 flex flex-col justify-end group relative">
          <div
            className="rounded-t transition-all"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 2 : 0, background: "#7eb8a4", opacity: 0.8 }}
            title={`${d.hour}h: ${d.count}`}
          />
          {d.hour % 6 === 0 && (
            <span className="text-[8px] mt-1 text-center" style={{ color: "#484640" }}>{d.hour}h</span>
          )}
        </div>
      ))}
    </div>
  );
}

function RankBars({ items, suffix, color }: { items: { label: string; value: number }[]; suffix: string; color: string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs w-5 flex-shrink-0 text-right font-bold" style={{ color: "#484640" }}>{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm truncate" style={{ color: "#e8e8e0" }}>{item.label}</span>
              <span className="text-xs flex-shrink-0" style={{ color: "#626250" }}>{item.value} {suffix}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full" style={{ width: `${(item.value / max) * 100}%`, background: color }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-xs py-4 text-center" style={{ color: "#484640" }}>{children}</p>;
}

function EmptyState({ days }: { days: number }) {
  return (
    <div className="rounded-2xl p-12 text-center" style={card}>
      <div className="text-4xl mb-4">📊</div>
      <h2 className="font-serif text-xl font-bold mb-2" style={{ color: "#f5f5f0" }}>Sem dados ainda</h2>
      <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: "#626250" }}>
        Ainda não há visitas ao menu nos últimos {days} dias. Partilha o QR code com os teus clientes —
        os dados aparecem aqui em tempo real.
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl" style={card} />)}
      </div>
      <div className="h-48 rounded-2xl" style={card} />
      <div className="h-48 rounded-2xl" style={card} />
    </div>
  );
}
