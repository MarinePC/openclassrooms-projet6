// src/components/dashboard/MonthlyKmBarChart.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Datum = {
  label: string; // "S1"..."S4"
  km: number;
  weekKey?: string;
  dateRange?: string;
};

// -------------------------
// Tooltip (KM + range)
// -------------------------
function KmTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const row = (payload[0]?.payload ?? {}) as Datum;
  const km = Number(row.km ?? 0);
  const dateRange = row.dateRange ?? "Date inconnue";

  return (
    <div
      style={{
        width: 108,
        height: 82,
        background: "#1A1A1A",
        borderRadius: 8,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 400,
          color: "#E7E7E7",
          lineHeight: "1.2",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {dateRange}
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: "#E7E7E7",
          lineHeight: "1.2",
        }}
      >
        {km.toFixed(1)} km
      </div>
    </div>
  );
}

// -------------------------
// Legend (rond violet 8px + "Km")
// -------------------------
function MonthlyKmLegend() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: "#7987FF",
          display: "inline-block",
        }}
      />
      <span
        style={{
          fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial",
          fontSize: 12,
          fontWeight: 400,
          color: "#707070",
        }}
      >
        Km
      </span>
    </div>
  );
}

// -------------------------
// Shape: arrondi léger en haut uniquement
// (et pas "pilule" quand la barre est petite)
// -------------------------
function TopRoundedBarShape(props: any) {
  const { x, y, width, height, fill } = props;

  // radius voulu (léger) mais jamais > moitié de la hauteur
  const r = Math.min(8, height / 2);

  // path rectangle avec coins arrondis seulement en haut
  const d = `
    M ${x},${y + r}
    Q ${x},${y} ${x + r},${y}
    L ${x + width - r},${y}
    Q ${x + width},${y} ${x + width},${y + r}
    L ${x + width},${y + height}
    L ${x},${y + height}
    Z
  `;

  return <path d={d} fill={fill} />;
}

// -------------------------
// Chart
// -------------------------
export default function MonthlyKmBarChart({ data }: { data: Datum[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = useMemo(() => (data ?? []).slice(-4), [data]);

  return (
    <ResponsiveContainer width={330} height={307}>
      <BarChart
        data={chartData}
        barCategoryGap={36}
        barGap={4}
        onMouseLeave={() => setActiveIndex(null)}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />

        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: "#707070" }}
          tick={{
            fontSize: 12,
            fill: "#707070",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial",
            fontWeight: 400,
          }}
          tickMargin={18}
          height={50}
        />

        <YAxis
          tickLine={false}
          axisLine={{ stroke: "#707070" }}
          tick={{
            fontSize: 10, // ✅ chiffres gauche 10px
            fill: "#707070",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial",
            fontWeight: 400,
          }}
          // ✅ très important: si YAxis est trop large, tout part à droite
          width={24}
          tickMargin={10}
        />

        <Tooltip content={<KmTooltip />} cursor={{ fill: "transparent" }} />

        <Legend
          verticalAlign="bottom"
          align="left"
          wrapperStyle={{ paddingLeft: 0, paddingTop: 10 }}
          content={<MonthlyKmLegend />}
        />

        <Bar
          dataKey="km"
          barSize={14} // ✅ largeur 14px
          fill="#B6BDFC"
          isAnimationActive={false}
          shape={(props: any) => {
            const isActive = activeIndex === props.index;
            return (
              <g
                onMouseEnter={() => setActiveIndex(props.index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <TopRoundedBarShape
                  {...props}
                  fill={isActive ? "#0B23F4" : "#B6BDFC"}
                />
              </g>
            );
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
