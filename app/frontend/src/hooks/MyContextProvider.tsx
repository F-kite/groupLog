import React, { createContext, useState } from "react";
import { StudentsProps } from "@/types/student";
import { WeekScheduleProps } from "@/types/schedule";
import { AttendanceProps } from "@/types/attendance";
import { BaseUserInfoProps } from "@/types/user";

interface MyContextProps {
  baseUserInfo: BaseUserInfoProps;
  students: StudentsProps[];
  weekSchedule: WeekScheduleProps;
  attendanceLog: AttendanceProps[];
  setBaseUserInfo: (baseUserInfo: BaseUserInfoProps) => void;
  setStudents: (students: StudentsProps[]) => void;
  setWeekSchedule: (weekSchedule: WeekScheduleProps) => void;
  setAttendanceLog: (attendanceLog: AttendanceProps[]) => void;
}

export const MyContext = createContext<MyContextProps | null>(null);

export const MyContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [baseUserInfo, setBaseUserInfo] = useState<BaseUserInfoProps>({
    currentGroup: "ИСт-221",
    currentWeeksNumber: 12,
    currentDate: "",
  });
  const [students, setStudents] = useState<StudentsProps[]>([]);
  const [weekSchedule, setWeekSchedule] = useState<WeekScheduleProps>({
    week_number: 0,
    group_name: "",
    start_date: "",
    end_date: "",
    days: [],
  });
  const [attendanceLog, setAttendanceLog] = useState<AttendanceProps[]>([]);

  return (
    <MyContext.Provider
      value={{
        baseUserInfo,
        students,
        weekSchedule,
        attendanceLog,
        setBaseUserInfo,
        setStudents,
        setWeekSchedule,
        setAttendanceLog,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};
