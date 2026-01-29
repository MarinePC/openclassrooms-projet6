//src/components/dashboard/ActivityBarChart.tsx
"use client";

import type { ActivityDatum } from "@/services/userData";
import BarChartBase from "@/components/dashboard/BarChartBase";

export default function ActivityBarChart({ data }: { data: ActivityDatum[] }) {
  return (
    <BarChartBase
      data={data}
      xKey="date"
      bars={[
        { dataKey: "distance", name: "Distance (km)", fill: "#B6BDFC", barSize: 14 },
        { dataKey: "caloriesBurned", name: "Calories brûlées", fill: "#0B23F4", barSize: 14 },
      ]}
      barGap={8}
      grid
      verticalGrid={false}
      tooltip
    />
  );
}
