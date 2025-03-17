import React, { createContext, useState } from "react";
import { StudentsProps } from "@/types/student";
import { WeekScheduleProps } from "@/types/schedule";

interface MyContextProps {
  students: StudentsProps[];
  weekSchedule: WeekScheduleProps;
  setStudents: (students: StudentsProps[]) => void;
  setWeekSchedule: (weekSchedule: WeekScheduleProps) => void;
}

export const MyContext = createContext<MyContextProps | null>(null);

export const MyContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [students, setStudents] = useState<StudentsProps[]>([]);
  const [weekSchedule, setWeekSchedule] = useState<WeekScheduleProps>({
    weekNumber: 0,
    groupName: "",
    startDate: "",
    endDate: "",
    days: [],
  });

  return (
    <MyContext.Provider
      value={{ students, weekSchedule, setStudents, setWeekSchedule }}
    >
      {children}
    </MyContext.Provider>
  );
};
