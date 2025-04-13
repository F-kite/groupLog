import Header from "@/components/Header/Header";
import styles from "./styles.module.scss";
import { ReactNode } from "react";
import Footer from "@/components/Footer/Footer";

import { useContext, useEffect } from "react"; // Добавляем useState
import { MyContext } from "@/hooks/MyContextProvider";
import studentApi from "@/utils/api/students";
import scheduleApi from "@/utils/api/schedule";
import attendanceApi from "@/utils/api/attendance";

export default function MainLayout({ children }: { children: ReactNode }) {
  const context = useContext(MyContext);

  if (!context) {
    throw new Error("MyContext must be used within a MyProvider");
  }
  const { userInfo, currentInfo } = context;
  const { students, setStudents } = context;
  const { weekSchedule, setWeekSchedule } = context;
  const { attendanceLog, setAttendanceLog } = context;

  if (userInfo.group != null && userInfo.group != undefined) {
    useEffect(() => {
      const fetchStudentsData = async () => {
        try {
          const studentsResponse = await studentApi.getStudentsByGroup(
            userInfo.group
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
    }, [userInfo.group, setStudents]);

    useEffect(() => {
      const fetchScheduleData = async () => {
        try {
          const scheduleResponse = await scheduleApi.getWeekSchedule(
            userInfo.group,
            currentInfo.currentWeeksNumber
          );
          if (scheduleResponse.error) {
            throw new Error(scheduleResponse.error);
          }
          setWeekSchedule(scheduleResponse);
        } catch (error: any) {
          setWeekSchedule({
            week_number: 0,
            start_date: "",
            end_date: "",
            days: [],
          });
          console.error(error);
        }
      };

      if (userInfo.group && currentInfo.currentWeeksNumber) {
        fetchScheduleData();
      }
    }, [
      currentInfo,
      userInfo.group,
      currentInfo.currentWeeksNumber,
      setWeekSchedule,
    ]);

    useEffect(() => {
      const fetchAttendanceData = async () => {
        try {
          const attendanceResponse = await attendanceApi.getAttendanceByGroup(
            userInfo.group,
            currentInfo.currentDate
          );
          if (attendanceResponse.error) {
            throw new Error(attendanceResponse.error);
          }
          setAttendanceLog(attendanceResponse);
        } catch (error: any) {
          console.error(error);
        }
      };

      if (userInfo.group && currentInfo.currentDate) {
        fetchAttendanceData();
      }
    }, [userInfo.group, currentInfo.currentDate, setAttendanceLog]);
  }
  console.log({
    userInfo,
    currentInfo,
    students,
    weekSchedule,
    attendanceLog,
  });

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
