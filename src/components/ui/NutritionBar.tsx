"use client";

type Props = {
  label: string;
  value: number;
  unit: string;
  max: number;
  color: string;
};

export function NutritionBar({ label, value, unit, max, color }: Props) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline text-xs">
        <span style={{ color: "#96967f" }}>{label}</span>
        <span className="font-semibold tabular-nums" style={{ color: "#d4d4c8" }}>
          {value} <span style={{ color: "#626250", fontWeight: 400 }}>{unit}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
