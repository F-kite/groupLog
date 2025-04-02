import Header from "@/components/Header/Header";
import styles from "./styles.module.scss";
import { ReactNode } from "react";
import Footer from "@/components/Footer/Footer";

import { useContext, useEffect } from "react";
import { MyContext } from "@/hooks/MyContextProvider";
import studentApi from "@/utils/api/students";
import scheduleApi from "@/utils/api/schedule";
import attendanceApi from "@/utils/api/attendance";

export default function MainLayout({ children }: { children: ReactNode }) {
  const context = useContext(MyContext);

  if (!context) {
    throw new Error("MyContext must be used within a MyProvider");
  }
  const { baseUserInfo } = context;
  const { students, setStudents } = context;
  const { weekSchedule, setWeekSchedule } = context;
  const { attendanceLog, setAttendanceLog } = context;

  useEffect(() => {
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
        console.error(error);
      }
    };

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

    fetchStudentsData();
    fetchScheduleData();
    fetchAttendanceData();
  }, [setStudents, setWeekSchedule, setAttendanceLog]);

  console.log({ baseUserInfo, students, weekSchedule, attendanceLog });

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
