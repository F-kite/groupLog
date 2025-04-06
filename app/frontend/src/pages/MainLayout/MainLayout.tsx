import Header from "@/components/Header/Header";
import styles from "./styles.module.scss";
import { ReactNode } from "react";
import Footer from "@/components/Footer/Footer";

import { useContext, useEffect, useState } from "react"; // Добавляем useState
import { MyContext } from "@/hooks/MyContextProvider";
import studentApi from "@/utils/api/students";
import scheduleApi from "@/utils/api/schedule";
import attendanceApi from "@/utils/api/attendance";

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

export default function MainLayout({ children }: { children: ReactNode }) {
  const context = useContext(MyContext);
  const [isBaseUserInfoReady, setIsBaseUserInfoReady] = useState(false);

  if (!context) {
    throw new Error("MyContext must be used within a MyProvider");
  }
  const { baseUserInfo, setBaseUserInfo } = context;
  const { setStudents } = context;
  const { setWeekSchedule } = context;
  const { setAttendanceLog } = context;

  useEffect(() => {
    const initializeBaseUserInfo = async () => {
      const currentDate = new Date();
      setBaseUserInfo({
        currentGroup: "ИСт-221",
        currentWeeksNumber: getCustomWeekNumber(currentDate),
        currentDate: currentDate.toISOString().split("T")[0],
      });
      setIsBaseUserInfoReady(true);
    };

    initializeBaseUserInfo();
  }, []);

  useEffect(() => {
    if (!baseUserInfo.currentGroup || !isBaseUserInfoReady) return;

    const fetchStudentsData = async () => {
      try {
        const studentsResponse = await studentApi.getStudentsByGroup(
          baseUserInfo.currentGroup
        );
        if (studentsResponse.error) {
          throw new Error(studentsResponse.error);
        }
        setStudents(studentsResponse);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStudentsData();
  }, [isBaseUserInfoReady, baseUserInfo.currentGroup, setStudents]);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const scheduleResponse = await scheduleApi.getWeekSchedule(
          baseUserInfo.currentGroup,
          baseUserInfo.currentWeeksNumber
        );
        if (scheduleResponse.error) {
          throw new Error(scheduleResponse.error);
        }
        setWeekSchedule(scheduleResponse);
      } catch (error: any) {
        setWeekSchedule({
          week_number: 0,
          group_name: "",
          start_date: "",
          end_date: "",
          days: [],
        });
        console.error(error);
      }
    };

    if (
      isBaseUserInfoReady &&
      baseUserInfo.currentGroup &&
      baseUserInfo.currentWeeksNumber
    ) {
      fetchScheduleData();
    }
  }, [
    isBaseUserInfoReady,
    baseUserInfo,
    baseUserInfo.currentGroup,
    baseUserInfo.currentWeeksNumber,
    setWeekSchedule,
  ]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const attendanceResponse = await attendanceApi.getAttendanceByGroup(
          baseUserInfo.currentGroup,
          baseUserInfo.currentDate
        );
        if (attendanceResponse.error) {
          throw new Error(attendanceResponse.error);
        }
        setAttendanceLog(attendanceResponse);
      } catch (error: any) {
        console.error(error);
      }
    };

    if (
      isBaseUserInfoReady &&
      baseUserInfo.currentGroup &&
      baseUserInfo.currentDate
    ) {
      fetchAttendanceData();
    }
  }, [
    isBaseUserInfoReady,
    baseUserInfo.currentGroup,
    baseUserInfo.currentDate,
    setAttendanceLog,
  ]);

  return (
    <div className={styles.layout}>
      <header>
        <Header />
      </header>
      <main>{children}</main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
