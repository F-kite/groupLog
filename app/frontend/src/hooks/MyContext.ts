import { createContext, useContext } from "react";
import { StudentsProps } from "@/types/student";
import { WeekScheduleProps } from "@/types/schedule";

interface MyContextProps {
  students: StudentsProps[];
  dailySchedule: WeekScheduleProps;
}

export const MyContext = createContext<MyContextProps | null>({
  students: [],
  dailySchedule: {
    weekNumber: 0,
    groupName: "",
    startDate: "",
    endDate: "",
    days: [],
  },
});

export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within a MyProvider");
  }
  return context;
};
