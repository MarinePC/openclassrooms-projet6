// src/components/dashboard/KmBarChart.tsx

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

type KmDatum = { name: string; km: number };

function KmLegend() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3.5 }}>
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 999,
          background: "#6E78FF",
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

export default function KmBarChart({ data }: { data: KmDatum[] }) {
  return (
    <div className="kmChart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
          barCategoryGap={61}
          barGap={0}
        >
          <CartesianGrid vertical={false} stroke="#E7E7E7" strokeDasharray="3 4" />

          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={{ stroke: "#707070" }}
            tick={{
              fill: "#707070",
              fontSize: 12,
              fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial",
              fontWeight: 400,
            }}
            dy={18}
          />

          <YAxis
            domain={[0, 30]}
            ticks={[0, 10, 20, 30]}
            tickLine={false}
            axisLine={{ stroke: "#707070" }}
            tick={{
              fill: "#707070",
              fontSize: 12,
              fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial",
              fontWeight: 400,
            }}
            width={30}
          />

          <Legend
            verticalAlign="bottom"
            align="left"
            wrapperStyle={{ paddingLeft: 6, paddingTop: 10 }}
            content={<KmLegend />}
          />

          <Bar
            dataKey="km"
            fill="#B6BDFC"
            barSize={14}
            radius={[999, 999, 999, 999]}
            activeBar={{ fill: "#0B23F4" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
