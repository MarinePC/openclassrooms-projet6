// src/components/dashboard/HeartRateComposedChart.tsx
"use client";

import { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

type HeartRateDay = {
  day: string;
  min: number;
  max: number;
  avg: number;
};

type Props = {
  data: HeartRateDay[];
};

function HeartLegend() {
  return (
    <div style={{ display: "flex", gap: 24, fontSize: 12, color: "#707070" }}>
      <span>
        <span style={{ color: "#FCC1B6", marginRight: 3.5 }}>●</span> Min
      </span>
      <span>
        <span style={{ color: "#F4320B", marginRight: 3.5 }}>●</span> Max BPM
      </span>
      <span>
        <span style={{ color: "#0B23F4", marginRight: 3.5 }}>●</span> Avg
      </span>
    </div>
  );
}

export default function HeartRateComposedChart({ data }: Props) {
  const [isHovering, setIsHovering] = useState(false);

  if (!data || data.length === 0) {
    return <div style={{ width: "100%", height: "100%" }} />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        /* ✅ “resserré” bas/gauche : on retire les marges inutiles */
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        barCategoryGap={36}
        barGap={4}
        onMouseMove={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <CartesianGrid vertical={false} stroke="#E7E7E7" strokeDasharray="3 4" />

        <XAxis
          dataKey="day"
          tick={{ fontSize: 12, fill: "#707070" }}
          tickLine={false}
          axisLine={{ stroke: "#707070" }}
        />

        <YAxis
          domain={[130, 190]}
          ticks={[0, 130, 145, 160, 175, 190]}
          tick={{ fontSize: 10, fill: "#707070" }}
          tickLine={false}
          axisLine={{ stroke: "#707070" }}
          width={28}
        />

        {/* hover*/}
        <Tooltip content={() => null} cursor={{ fill: "transparent" }} />

        <Legend verticalAlign="bottom" align="left" content={<HeartLegend />} />

        <Bar
          dataKey="min"
          barSize={14}
          fill="#FCC1B6"
          radius={[999, 999, 999, 999]}
        />

        <Bar
          dataKey="max"
          barSize={14}
          fill="#F4320B"
          radius={[999, 999, 999, 999]}
        />

        {/* ✅ Hover : point reste bleu, courbe grise devient bleue */}
        <Line
          type="monotone"
          dataKey="avg"
          stroke={isHovering ? "#0B23F4" : "#F2F3FF"}
          strokeWidth={3}
          dot={{ r: 4, fill: "#0B23F4", stroke: "#0B23F4" }}
          activeDot={{ r: 4, fill: "#0B23F4", stroke: "#0B23F4" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

