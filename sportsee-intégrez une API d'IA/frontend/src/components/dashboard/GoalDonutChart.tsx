// src/components/dashboard/GoalDonutChart.tsx
"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type Props = {
  done: number;
  goal: number;
};

export default function GoalDonutChart({ done, goal }: Props) {
  const safeGoal = Math.max(0, goal ?? 0);
  const safeDone = Math.max(0, done ?? 0);

  const doneClamped = safeGoal === 0 ? 0 : Math.min(safeDone, safeGoal);
  const remaining = Math.max(0, safeGoal - doneClamped);

  const data = safeGoal === 0 
    ? [{ name: "empty", value: 1 }]
    : [
        { name: "done", value: doneClamped },
        { name: "remaining", value: remaining },
      ];

  return (
    <div className="goalDonutWrap">
      <div className="goalDonutTitle">
        <span className="goalDonutX">x{doneClamped}</span>{" "}
        <span className="goalDonutOn">sur objectif de {safeGoal}</span>
      </div>
      <div className="goalDonutSub">Courses hebdomadaire réalisées</div>

      <div className="goalDonutChartContainer">
        <div className="goalDonutLegendLeft">
          <span className="goalDot goalDotDone" />
          <span>{doneClamped} réalisée{doneClamped > 1 ? 's' : ''}</span>
        </div>

        <div className="goalDonutChart">
          <div className="goalChartBox">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="90%"
                  startAngle={300}
                  endAngle={-100}
                  isAnimationActive={false}
                >
                  {safeGoal === 0 ? (
                    <Cell fill="#E0E0E0" />
                  ) : (
                    <>
                      <Cell fill="#0B23F4" />
                      <Cell fill="#B6BDFC" />
                    </>
                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="goalDonutLegendRight">
          <span className="goalDot goalDotRem" />
          <span>{remaining} restant{remaining > 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
