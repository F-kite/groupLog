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

const dailyData = [
  { lesson: "1 пара", time: "9:00-10:30", attendance: 75 },
  { lesson: "2 пара", time: "10:50-12:20", attendance: 90 },
  { lesson: "3 пара", time: "13:20-14:50", attendance: 85 },
  { lesson: "4 пара", time: "15:10-16:40", attendance: 80 },
  { lesson: "5 пара", time: "17:00-18:30", attendance: 70 },
  { lesson: "6 пара", time: "18:50-20:20", attendance: 20 },
];

const weeklyData = [
  { date: "01.01.2025", day: "Пн", attendance: 85 },
  { date: "02.01.2025", day: "Вт", attendance: 88 },
  { date: "03.01.2025", day: "Ср", attendance: 90 },
  { date: "04.01.2025", day: "Чт", attendance: 87 },
  { date: "05.01.2025", day: "Пт", attendance: 82 },
  { date: "06.01.2025", day: "Сб", attendance: 20 },
];

const monthlyData = [
  { fullMonth: "Январь", shortMonth: "Янв", attendance: 82 },
  { fullMonth: "Февраль", shortMonth: "Фев", attendance: 85 },
  { fullMonth: "Март", shortMonth: "Мар", attendance: 88 },
  { fullMonth: "Апрель", shortMonth: "Апр", attendance: 87 },
  { fullMonth: "Май", shortMonth: "Май", attendance: 90 },
  { fullMonth: "Июнь", shortMonth: "Июн", attendance: 92 },
  { fullMonth: "Июль", shortMonth: "Июл", attendance: 95 },
  { fullMonth: "Август", shortMonth: "Авг", attendance: 93 },
  { fullMonth: "Сентябрь", shortMonth: "Сен", attendance: 89 },
  { fullMonth: "Октябрь", shortMonth: "Окт", attendance: 86 },
  { fullMonth: "Ноябрь", shortMonth: "Ноя", attendance: 84 },
  { fullMonth: "Декабрь", shortMonth: "Дек", attendance: 83 },
];

type Period = "day" | "week" | "month";

export default function VisitorChart() {
  const [period, setPeriod] = useState<Period>("day");

  const data = {
    day: dailyData,
    week: weeklyData,
    month: monthlyData,
  }[period];

  const periodLabels = {
    day: "День",
    week: "Неделя",
    month: "Месяц",
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* <h2 className={styles.title}>Статистика посещаемости группы</h2> */}
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
