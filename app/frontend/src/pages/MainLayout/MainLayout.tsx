import Header from "@/components/Header/Header";
import styles from "./styles.module.scss";
import { ReactNode } from "react";
import Footer from "@/components/Footer/Footer";

import { useContext, useEffect } from "react"; // Добавляем useState
import { MyContext } from "@/lib/hooks/MyContextProvider";
import studentApi from "@/lib/api/students";
import scheduleApi from "@/lib/api/schedule";
import attendanceApi from "@/lib/api/attendance";
import AdminPanel from "@/pages/AdminPanel/AdminPanel";
import userApi from "@/lib/api/users";

export default function MainLayout({ children }: { children: ReactNode }) {
  const context = useContext(MyContext);

  if (!context) {
    throw new Error("MyContext must be used within a MyProvider");
  }
  const { userInfo, setUserInfo, currentInfo } = context;
  const { students, setStudents } = context;
  const { weekSchedule, setWeekSchedule } = context;
  const { attendanceLog, setAttendanceLog } = context;

  useEffect(() => {
    const getUserInformation = async () => {
      try {
        const response = await userApi.getUserInfo();
        if (response.error) {
          console.error("Ошибка:", response.error);
          throw new Error(response.error);
        }
        setUserInfo({ ...userInfo, ...response });
      } catch (error) {
        console.error("Не удалось выполнить проверку:", error);
      }
    };

    getUserInformation();
  }, [setUserInfo]);

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

    if (userInfo.group) fetchStudentsData();
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
      {userInfo.role == "administrator" ? (
        <main>
          <AdminPanel />
        </main>
      ) : (
        <main>{children}</main>
      )}

      <footer>
        <Footer />
      </footer>
    </div>
  );
}
