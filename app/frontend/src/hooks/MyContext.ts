import { createContext, useContext } from "react";
import { StudentsProps } from "@/types/student";
import { WeekScheduleProps } from "@/types/schedule";
import { AttendanceProps } from "@/types/attendance";
import { CurrentInfoProps, UserInfoProps } from "@/types/user";

interface MyContextProps {
  userInfo: UserInfoProps;
  currentInfo: CurrentInfoProps;
  students: StudentsProps[];
  dailySchedule: WeekScheduleProps;
  attendanceLog: AttendanceProps[];
}

export const MyContext = createContext<MyContextProps>({
  userInfo: {
    name: "",
    email: "",
    role: "",
    group: "",
  },
  currentInfo: {
    currentWeeksNumber: 0,
    currentDate: new Date().toISOString().split("T")[0],
  },
  students: [],
  dailySchedule: {
    week_number: 0,
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
