import React, { createContext, useState } from "react";
import { StudentsProps } from "@/lib/types/student";
import { WeekScheduleProps } from "@/lib/types/schedule";
import { AttendanceProps } from "@/lib/types/attendance";
import { CurrentInfoProps, UserInfoProps } from "@/lib/types/user";

interface MyContextProps {
  userInfo: UserInfoProps;
  currentInfo: CurrentInfoProps;
  students: StudentsProps[];
  weekSchedule: WeekScheduleProps;
  attendanceLog: AttendanceProps[];
  setUserInfo: (userInfo: UserInfoProps) => void;
  setCurrentInfo: (currentInfo: CurrentInfoProps) => void;
  setStudents: (students: StudentsProps[]) => void;
  setWeekSchedule: (weekSchedule: WeekScheduleProps) => void;
  setAttendanceLog: (attendanceLog: AttendanceProps[]) => void;
}

function getCustomWeekNumber(date: Date): number {
  // Дата начала первой недели (13 января)
  const startOfFirstWeek = new Date(date.getFullYear(), 0, 13);

  // Проверяем, что дата не раньше начала первой недели
  if (date < startOfFirstWeek) {
    return 0;
  }
  const diffInMilliseconds = date.getTime() - startOfFirstWeek.getTime();
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffInDays / 7) + 1;
  return weekNumber;
}

export const MyContext = createContext<MyContextProps>({
  userInfo: {
    name: "",
    email: "",
    role: "",
    group: "",
  },
  currentInfo: {
    currentWeeksNumber: getCustomWeekNumber(new Date()),
    currentDate: new Date().toISOString().split("T")[0],
  },
  students: [],
  weekSchedule: {
    week_number: 0,
    start_date: "",
    end_date: "",
    days: [],
  },
  attendanceLog: [],
  setUserInfo: () => {},
  setCurrentInfo: () => {},
  setStudents: () => {},
  setWeekSchedule: () => {},
  setAttendanceLog: () => {},
});

export const MyContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userInfo, setUserInfo] = useState<UserInfoProps>({
    name: "",
    email: "",
    role: "",
    group: "",
  });
  const [currentInfo, setCurrentInfo] = useState<CurrentInfoProps>({
    currentWeeksNumber: getCustomWeekNumber(new Date()),
    currentDate: new Date().toISOString().split("T")[0],
  });
  const [students, setStudents] = useState<StudentsProps[]>([]);
  const [weekSchedule, setWeekSchedule] = useState<WeekScheduleProps>({
    week_number: 0,
    start_date: "",
    end_date: "",
    days: [],
  });
  const [attendanceLog, setAttendanceLog] = useState<AttendanceProps[]>([]);

  return (
    <MyContext.Provider
      value={{
        userInfo,
        currentInfo,
        students,
        weekSchedule,
        attendanceLog,
        setUserInfo,
        setCurrentInfo,
        setStudents,
        setWeekSchedule,
        setAttendanceLog,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};
