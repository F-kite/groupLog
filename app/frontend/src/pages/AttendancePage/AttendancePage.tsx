import { useContext, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MyContext } from "@/hooks/MyContextProvider";
import { DailyScheduleProps, DailyScheduleLessonProps } from "@/types/schedule";
import { StudentsProps } from "@/types/student";
import { Attendance_logProps } from "@/types/attendance";
import styles from "./styles.module.scss";
import { groupLessonsByTime, GroupedLessons } from "@/hooks/groupLessonsByTime";

type StudentAttendanceProps = Omit<
  StudentsProps,
  "email" | "phone" | "enrollment_year"
> & {
  studentLog: Attendance_logProps[];
};

export default function AttendanceTable() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("MyContext must be used within a MyProvider");
  }
  const { userInfo, currentInfo, students, weekSchedule, attendanceLog } =
    context;

  // Режим работы: true - изменение одного студента, false - изменение нескольких студентов
  const [isSingleEditMode, setIsSingleEditMode] = useState(false);

  const dailySchedule = getDailyScheduleByDate(currentInfo.currentDate);
  let groupedLessons: GroupedLessons = {}; // Инициализация по умолчанию

  if (dailySchedule != null) {
    groupedLessons = groupLessonsByTime(dailySchedule?.lessons);
  }

  const [studentAttendance, setStudentAttendance] = useState<
    StudentAttendanceProps[]
  >([]);

  useEffect(() => {
    const generateStudentAttendance = () => {
      const attendanceList: StudentAttendanceProps[] = students.map(
        (student) => {
          const { student_id, subgroup, name, surname, tgid } = student;
          const checkAttendanceRecord = attendanceLog.filter(
            (log) =>
              log.student_id === student_id && log.attendance_log.length !== 0
          );

          let studentLog: Attendance_logProps[] = [];

          if (checkAttendanceRecord.length !== 0) {
            studentLog = getAttendanceLogByStudentId(student_id);
          } else if (dailySchedule != null) {
            const logInfoArr: Attendance_logProps[] = [];
            for (const [key, value] of Object.entries(groupedLessons)) {
              let subject: DailyScheduleLessonProps | null = null;
              switch (value.length) {
                case 1:
                  const les = value[0];
                  if (!les.subject_name.includes(`п/г`)) subject = les;
                  else if (les.subject_name.includes(`${subgroup} п/г`))
                    subject = les;
                  break;
                case 2:
                  const les1 = value[0];
                  const les2 = value[1];
                  subject = subgroup === 1 ? les1 : les2;
                  break;
              }

              if (subject == null) {
                continue;
              }

              const logInfo: Attendance_logProps = {
                date: currentInfo.currentDate,
                status: "",
                subject_id: subject.subject_id,
                day_id: dailySchedule.day_id,
                lesson_id: subject?.lesson_id,
              };

              logInfoArr.push(logInfo);
            }

            studentLog = logInfoArr;
          }

          return {
            student_id,
            subgroup,
            name,
            surname,
            tgid,
            studentLog,
          };
        }
      );

      setStudentAttendance(attendanceList);
    };

    generateStudentAttendance();
  }, [students, attendanceLog, dailySchedule]);

  // Переключение режима работы
  const toggleEditMode = () => {
    setIsSingleEditMode((prev) => !prev);
  };

  // Обновление статуса посещаемости
  const updateAttendanceStatus = (
    studentId: number,
    lessonId: number,
    newStatus: string
  ) => {
    setStudentAttendance((prevAttendance) =>
      prevAttendance.map((student) =>
        student.student_id === studentId
          ? {
              ...student,
              studentLog: student.studentLog.map((log) =>
                log.lesson_id === lessonId ? { ...log, status: newStatus } : log
              ),
            }
          : student
      )
    );
  };

  function getAttendanceLogByStudentId(
    studentId: number
  ): Attendance_logProps[] {
    const studentData = attendanceLog.find(
      (log) => log.student_id === studentId
    );
    return studentData?.attendance_log || [];
  }

  function getDailyScheduleByDate(date: string): DailyScheduleProps | null {
    const data = weekSchedule.days.find((schedule) => schedule.date === date);
    return data || null;
  }

  return (
    <div className={styles.container}>
      {/* Заголовок */}
      <div className={styles.title}>
        <div className={styles.info}>
          <p>Посещаемость группы {userInfo.group}</p>
          <p className={styles.numStudents}>{students.length} студента</p>
          <p className={styles.numStudents}>{currentInfo.currentDate}</p>
        </div>
        <div className={styles.buttons}>
          <Button onClick={toggleEditMode} variant="auth">
            {isSingleEditMode
              ? "Одиночное редактирование"
              : "Массовое редактирование"}
          </Button>
          <Button variant="auth">Сохранить изменения</Button>
        </div>
      </div>

      {/* Таблица посещаемости */}
      <Table className={styles.table}>
        <TableHeader>
          <TableRow>
            <TableHead
              className={`${styles.studentCellHead} ${styles.studentCell}`}
            >
              {!isSingleEditMode && (
                <Checkbox className={styles.studentCheckbox} />
              )}
              Студенты
            </TableHead>
            {groupedLessons &&
              Object.keys(groupedLessons).map((key) => (
                <TableHead key={key} className={styles.lessonCell}>
                  {key}-я пара
                </TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {studentAttendance.map((att) => {
            return (
              <TableRow key={att.student_id} className={styles.tableRow}>
                <TableCell className={styles.studentCell}>
                  {!isSingleEditMode && (
                    <Checkbox className={styles.studentCheckbox} />
                  )}
                  {`${att.surname} ${att.name}`}
                </TableCell>
                {groupedLessons &&
                  Object.keys(groupedLessons).map((key) => {
                    const lessons = groupedLessons[key];
                    const relevantLesson = lessons.find(
                      (lesson) =>
                        !lesson.subject_name.includes("п/г") ||
                        lesson.subject_name.includes(`${att.subgroup} п/г`)
                    );

                    const log = att.studentLog.find(
                      (log) => log.lesson_id === relevantLesson?.lesson_id
                    );

                    return (
                      <TableCell key={key} className={styles.lessonCell}>
                        {relevantLesson ? (
                          <Select
                            value={log?.status || ""}
                            onValueChange={(value) => {
                              updateAttendanceStatus(
                                att.student_id,
                                relevantLesson.lesson_id,
                                value
                              );
                            }}
                          >
                            <SelectTrigger className={styles.selectTrigger}>
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="П">Присутствует</SelectItem>
                              <SelectItem value="Б">Болеет</SelectItem>
                              <SelectItem value="УП">
                                Уважительная причина
                              </SelectItem>
                              <SelectItem value="Н">Отсутствует</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className={styles.noLesson}>нет пары</span>
                        )}
                      </TableCell>
                    );
                  })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
