"use client";

import { useState, Fragment } from "react";
import {
  format,
  getWeek,
  startOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  setMonth,
} from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import styles from "./styles.module.scss";

interface CalendarProps {
  className?: string;
  showWeekNumbers?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  size?: "sm" | "md" | "lg";
  width?: string;
  height?: string;
}

export default function Calendar({
  className,
  showWeekNumbers = true,
  weekStartsOn = 1,
  size = "md",
  width = "50%",
  height = "auto",
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

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

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    console.log(`Selected ${date}`);
  };

  const handleMonthChange = (monthIndex: string) => {
    setCurrentDate(setMonth(currentDate, Number.parseInt(monthIndex)));
  };

  const sizeClasses = {
    sm: styles.small,
    md: styles.medium,
    lg: styles.large,
  };

  return (
    <div className={cn(styles.calendar, className)} style={{ width, height }}>
      <div className={styles.header}>
        <Button
          onClick={prevMonth}
          variant="outline"
          size="icon"
          className="flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={nextMonth}
          variant="outline"
          size="icon"
          className="flex-shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className={styles.monthYearSelector}>
          <Select
            value={currentDate.getMonth().toString()}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger
              className={cn(styles.monthSelect, sizeClasses[size])}
            >
              <SelectValue>{months[currentDate.getMonth()]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className={cn(styles.yearDisplay, sizeClasses[size])}>
            {currentDate.getFullYear()}
          </span>
        </div>

        <Button
          onClick={goToToday}
          variant="outline"
          size="sm"
          className="flex items-center"
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          Сегодня
        </Button>
      </div>
      <div
        className={cn(
          styles.calendarGrid,
          showWeekNumbers ? styles.weekNumbers : styles.noWeekNumbers
        )}
      >
        {showWeekNumbers && (
          <div className={cn(styles.dayOfWeek, sizeClasses[size])}>Нед</div>
        )}
        {daysOfWeek.map((day) => (
          <div key={day} className={cn(styles.dayOfWeek, sizeClasses[size])}>
            {day}
          </div>
        ))}
        {weeks.map(({ days, weekNumber }) => (
          <Fragment key={weekNumber}>
            {showWeekNumbers && (
              <div className={cn(styles.weekNumber, sizeClasses[size])}>
                {weekNumber}
              </div>
            )}
            {days.map((day) => (
              <button
                key={day.toString()}
                className={cn(
                  styles.day,
                  !isSameMonth(day, currentDate) && styles.outsideMonth,
                  isSameDay(day, new Date()) && styles.today,
                  selectedDate &&
                    isSameDay(day, selectedDate) &&
                    styles.selected,
                  sizeClasses[size]
                )}
                onClick={() => handleDateClick(day)}
              >
                {format(day, "d")}
              </button>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
