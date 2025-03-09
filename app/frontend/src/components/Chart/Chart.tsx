"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import styles from "./styles.module.scss";
import { Button } from "../ui/button";

import { AttendanceStatisticsProps, attendanceStatistics } from "@/store/data";

const {
  dailyStatistics,
  weeklyStatistics,
  monthlyStatistics,
}: AttendanceStatisticsProps = attendanceStatistics;

type Period = "day" | "week" | "month";

export default function VisitorChart() {
  const [period, setPeriod] = useState<Period>("day");

  const data = {
    day: dailyStatistics,
    week: weeklyStatistics,
    month: monthlyStatistics,
  }[period];

  const periodLabels = {
    day: "День",
    week: "Неделя",
    month: "Месяц",
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.periodButtons}>
          {Object.entries(periodLabels).map(([key, label]) => (
            <Button
              key={key}
              className={styles.button}
              variant="ghost"
              onClick={() => setPeriod(key as Period)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey={
                period === "day"
                  ? "lesson"
                  : period === "week"
                  ? "day"
                  : "shortMonth"
              }
              tickLine={false}
              axisLine={true}
              tickMargin={8}
            />
            <YAxis
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              domain={[0, 105]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Bar dataKey="attendance" radius={[10, 10, 0, 0]} />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className={styles.tooltip}>
                      <div className={styles.tooltipContent}>
                        <div>
                          <span className={styles.tooltipLabel}>
                            {period === "day"
                              ? "Время "
                              : period === "week"
                              ? "Дата "
                              : "Месяц "}
                          </span>
                          <span className={styles.tooltipValue}>
                            {period === "day"
                              ? data.time
                              : period === "week"
                              ? data.date
                              : data.fullMonth}
                          </span>
                        </div>
                        <div>
                          <span className={styles.tooltipLabel}>
                            Посещаемость
                          </span>
                          <span className={styles.tooltipValue}>
                            {" " + data.attendance}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
