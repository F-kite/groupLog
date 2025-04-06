import { createContext, useContext } from "react";
import { StudentsProps } from "@/types/student";
import { WeekScheduleProps } from "@/types/schedule";
import { AttendanceProps } from "@/types/attendance";
import { BaseUserInfoProps } from "@/types/user";

interface MyContextProps {
  baseUserInfo: BaseUserInfoProps;
  students: StudentsProps[];
  dailySchedule: WeekScheduleProps;
  attendanceLog: AttendanceProps[];
}

export const MyContext = createContext<MyContextProps>({
  baseUserInfo: {
    currentGroup: "",
    currentWeeksNumber: 0,
    currentDate: new Date().toISOString().split("T")[0],
  },
  students: [],
  dailySchedule: {
    week_number: 0,
    group_name: "",
    start_date: "",
    end_date: "",
    days: [],
  },
  attendanceLog: [],
});

export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within a MyProvider");
  }
  return context;
};
