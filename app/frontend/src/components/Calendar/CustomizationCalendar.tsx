"use client";

import * as React from "react";
import { ru } from "date-fns/locale";
import {
  format,
  getWeek,
  startOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  className?: string;
  showWeekNumbers?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  size?: "sm" | "md" | "lg";
  width?: string;
  height?: string;
}

export function CustomizableCalendar({
  className,
  showWeekNumbers = true,
  weekStartsOn = 1,
  size = "md",
  width = "100%",
  height = "auto",
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn });

  const weeks = [];
  let days = [];
  let day = startDate;
  let weekNumber = getWeek(startDate, { weekStartsOn });

  for (let i = 0; i < 42; i++) {
    if (i > 0 && i % 7 === 0) {
      weeks.push({ days, weekNumber });
      days = [];
      weekNumber = getWeek(day, { weekStartsOn });
    }
    days.push(day);
    day = addDays(day, 1);
  }
  weeks.push({ days, weekNumber });

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={cn("mx-auto", className)} style={{ width, height }}>
      <div className="flex items-center justify-between mb-4">
        <Button
          onClick={prevMonth}
          variant="outline"
          size="icon"
          className="flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2
          className={cn(
            "font-semibold text-center flex-grow px-2",
            sizeClasses[size]
          )}
        >
          {format(currentDate, "LLLL yyyy", { locale: ru })}
        </h2>
        <Button
          onClick={nextMonth}
          variant="outline"
          size="icon"
          className="flex-shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div
        className={cn(
          "grid gap-1",
          showWeekNumbers ? "grid-cols-8" : "grid-cols-7",
          "h-[calc(100%-3rem)]"
        )}
      >
        {showWeekNumbers && (
          <div className={cn("text-center font-medium", sizeClasses[size])}>
            Нед
          </div>
        )}
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className={cn("text-center font-medium", sizeClasses[size])}
          >
            {day}
          </div>
        ))}
        {weeks.map(({ days, weekNumber }) => (
          <React.Fragment key={weekNumber}>
            {showWeekNumbers && (
              <div
                className={cn(
                  "text-center text-muted-foreground",
                  sizeClasses[size]
                )}
              >
                {weekNumber}
              </div>
            )}
            {days.map((day) => (
              <Button
                key={day.toString()}
                variant="ghost"
                className={cn(
                  "h-full w-full p-0 flex items-center justify-center",
                  !isSameMonth(day, currentDate) &&
                    "text-muted-foreground opacity-50",
                  isSameDay(day, new Date()) &&
                    "bg-accent text-accent-foreground",
                  sizeClasses[size]
                )}
              >
                {format(day, "d")}
              </Button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
