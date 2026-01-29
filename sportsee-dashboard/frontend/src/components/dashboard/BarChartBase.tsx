//src/components/dashboard/BarChartBase.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

type BarSpec = {
  dataKey: string;
  name?: string;
  fill: string;
  activeFill?: string;
  barSize?: number;
  radius?: [number, number, number, number];
};

type Props<T extends Record<string, any>> = {
  data: T[];
  xKey: keyof T;
  bars: BarSpec[];

  // options
  height?: number | `${number}%`;
  grid?: boolean;
  verticalGrid?: boolean;
  tooltip?: boolean;
  legend?: boolean;
  customTooltip?: boolean;

  barCategoryGap?: number | string;
  barGap?: number;

  yAxisWidth?: number;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatDayMonth(date: Date): string {
  return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}`;
}

function startOfISOWeekFromKey(weekKey: string): Date {
  const [yStr, wStr] = weekKey.split("-W");
  const year = Number(yStr);
  const week = Number(wStr);

  const jan4 = new Date(`${year}-01-04T00:00:00`);
  const jan4Day = (jan4.getDay() + 6) % 7; // Mon=0
  const week1Monday = new Date(jan4);
  week1Monday.setDate(jan4.getDate() - jan4Day);

  const target = new Date(week1Monday);
  target.setDate(week1Monday.getDate() + (week - 1) * 7);
  target.setHours(0, 0, 0, 0);
  return target;
}

function weekKeyToRange(weekKey: string): string {
  const start = startOfISOWeekFromKey(weekKey);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${formatDayMonth(start)} au ${formatDayMonth(end)}`;
}


// Composant Tooltip personnalisé pour les km
function CustomKmTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const km = data.km || 0;
  const dateRange =
  data.dateRange ??
  (typeof data.weekKey === "string" ? weekKeyToRange(data.weekKey) : undefined) ??
  "Date inconnue";


  console.log("Tooltip data:", data); // Debug

  return (
    <div
      style={{
        width: "108px",
        height: "82px",
        background: "#1A1A1A",
        borderRadius: "8px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "4px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "14px",
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
          fontSize: "16px",
          fontWeight: 500,
          color: "yellow",
          lineHeight: "1.2",
        }}
      >
        {km.toFixed(1)} km
      </div>
    </div>
  );
}

export default function BarChartBase<T extends Record<string, any>>({
  data,
  xKey,
  bars,

  height = "100%",
  grid = true,
  verticalGrid = false,
  tooltip = true,
  legend = true,
  customTooltip = false,

  barCategoryGap,
  barGap,

  yAxisWidth = 20,
}: Props<T>) {
  const AXIS = "#717171";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        barCategoryGap={barCategoryGap}
        barGap={barGap}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        {grid && (
          <CartesianGrid
            stroke={AXIS}
            strokeDasharray="3 3"
            vertical={verticalGrid}
          />
        )}

        <XAxis
          dataKey={String(xKey)}
          axisLine={{ stroke: AXIS }}
          tickLine={{ stroke: AXIS }}
          tick={{ fontSize: 12, fill: AXIS }}
        />

        <YAxis
          width={yAxisWidth}
          axisLine={{ stroke: AXIS }}
          tickLine={{ stroke: AXIS }}
          tick={{ fontSize: 10, fill: AXIS }}
        />

        {tooltip && (
          <Tooltip
            cursor={{ fill: "transparent" }}
            content={customTooltip ? <CustomKmTooltip /> : undefined}
          />
        )}

        {legend && (
          <Legend
            verticalAlign="bottom"
            align="left"
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ fontSize: 12, color: "#707070" }}>{value}</span>
            )}
            wrapperStyle={{ paddingLeft: 4, marginTop: 0 }}
          />
        )}

        {bars.map((b) => (
          <Bar
            key={b.dataKey}
            dataKey={b.dataKey}
            name={b.name}
            fill={b.fill}
            barSize={b.barSize}
            radius={b.radius}
            activeBar={b.activeFill ? { fill: b.activeFill } : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}