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
import { groupLessonsByTime, GroupedLessons } from "@/hooks/groupLessonsByTime";
import { DailyScheduleProps, DailyScheduleLessonProps } from "@/types/schedule";
import { StudentsProps } from "@/types/student";
import { Attendance_logProps } from "@/types/attendance";
import { StudentMarkInfoProps } from "@/types/student";
import attendanceApi from "@/utils/api/attendance";
import styles from "./styles.module.scss";

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

  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

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
    setSelectedStudents([]); // Очищаем выбранных студентов
  };

  //Сохранение изменений
  const saveHandler = async () => {
    const requestData: StudentMarkInfoProps[] = [];
    const differences = findDifferences(studentAttendance, attendanceLog);

    console.log(differences);
    if (differences.length > 0) {
      const requestResult = await attendanceApi.updateAttendanceRecords(
        differences
      );
      if (requestResult.error) {
        console.error(requestResult.error);
      }
      alert(requestResult.success);
      return;
    }

    studentAttendance.map((student) => {
      student.studentLog.map((log) => {
        if (log.status !== "" && dailySchedule != null) {
          const record = {
            student_id: student.student_id,
            lesson_schedule_id: log.lesson_id,
            status: log.status,
            day_schedule_id: dailySchedule.day_id,
          };

          requestData.push(record);
        }
      });
    });

    console.log("requestData :", requestData);

    if (requestData.length !== 0) {
      console.log("Запрос отправлен");
      const requestResult = await attendanceApi.addAttendanceRecords(
        requestData
      );
      if (requestResult.error) {
        console.error(requestResult.error);
      }
      console.info(requestResult.success);
    }
  };

  // Обновление статуса посещаемости
  const updateAttendanceStatus = (
    studentId: number,
    lessonId: number,
    newStatus: string
  ) => {
    console.log(studentId, lessonId, newStatus);
    setStudentAttendance((prevAttendance) =>
      prevAttendance.map((student) =>
        student.student_id === studentId
          ? ({
              ...student,
              studentLog: student.studentLog.map((log) =>
                log.lesson_id === lessonId ? { ...log, status: newStatus } : log
              ),
            } as StudentAttendanceProps)
          : student
      )
    );
    console.log(studentAttendance);
  };

  //выбор отмеченных студентов
  const handleStudentCheckboxChange = (studentId: number, checked: boolean) => {
    setSelectedStudents((prev) =>
      checked ? [...prev, studentId] : prev.filter((id) => id !== studentId)
    );
  };

  const updateMarksForSelected = (lessonId: number, newStatus: string) => {
    setStudentAttendance((prevAttendance) =>
      prevAttendance.map((student) =>
        selectedStudents.includes(student.student_id)
          ? ({
              ...student,
              studentLog: student.studentLog.map((log) =>
                log.lesson_id === lessonId ? { ...log, status: newStatus } : log
              ),
            } as StudentAttendanceProps)
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

  // Функция для сравнения объектов
  function findDifferences(
    firstObject: typeof studentAttendance,
    secondObject: typeof attendanceLog
  ) {
    const differences: any = [];

    const attendanceLogMap = new Map<number, any>();
    secondObject.forEach((student) => {
      attendanceLogMap.set(student.student_id, student.attendance_log);
    });

    firstObject.forEach((student) => {
      const studentId = student.student_id;
      const logsFromSecondObject = attendanceLogMap.get(studentId) || [];

      student.studentLog.forEach((log) => {
        const match = logsFromSecondObject.find(
          (el: any) =>
            el.subject_id === log.subject_id &&
            el.lesson_id === log.lesson_id &&
            el.date === log.date
        );

        if (!match || match.status !== log.status) {
          differences.push({
            student_id: studentId,
            lesson_schedule_id: log.lesson_id,
            status: log.status,
            day_schedule_id: log.day_id,
          });
        }
      });
    });

    return differences;
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
          <Button onClick={saveHandler} variant="auth">
            Сохранить изменения
          </Button>
        </div>
      </div>

      {/* Таблица посещаемости */}
      <Table className={styles.table}>
        <TableHeader>
          <TableRow className={styles.tableRow}>
            <TableHead
              className={`${styles.studentCellHead} ${styles.studentCell}`}
            >
              {!isSingleEditMode && (
                <Checkbox
                  className={styles.studentCheckbox}
                  onCheckedChange={(checked) =>
                    studentAttendance.map((student) => {
                      handleStudentCheckboxChange(
                        student.student_id,
                        !!checked
                      );
                    })
                  }
                />
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
                    <Checkbox
                      className={styles.studentCheckbox}
                      checked={selectedStudents.includes(att.student_id)}
                      onCheckedChange={(checked) =>
                        handleStudentCheckboxChange(att.student_id, !!checked)
                      }
                    />
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
                              if (isSingleEditMode) {
                                updateAttendanceStatus(
                                  att.student_id,
                                  relevantLesson.lesson_id,
                                  value
                                );
                              } else if (selectedStudents.length > 0) {
                                updateMarksForSelected(
                                  relevantLesson.lesson_id,
                                  value
                                );
                              }
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
