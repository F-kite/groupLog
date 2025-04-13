import { useContext, useState } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MyContext } from "@/hooks/MyContextProvider";
import { StudentMarkInfoProps } from "@/types/student";
import { groupLessonsByTime } from "@/hooks/groupLessonsByTime";
import { lessonsTimeNumber } from "@/store/data";
import attendanceApi from "@/utils/api/attendance";
import styles from "./styles.module.scss";

type FormattedScheduleProps = {
  lessonNumber: number;
  subgroup: number;
  lessonId: number;
};

function getSubgroup(subjectName: string): number {
  if (subjectName.includes("1 п/г")) return 1;
  if (subjectName.includes("2 п/г")) return 2;
  return 0;
}

export default function AttendanceTable() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("MyContext must be used within a MyProvider");
  }
  const { userInfo, currentInfo, students, weekSchedule, attendanceLog } =
    context;

  // Логика форматирования расписания
  const formatSchedule = () => {
    const dayNumber = (new Date(currentInfo.currentDate).getDay() + 6) % 7;
    const currentDaySchedule = weekSchedule.days[dayNumber];
    if (!currentDaySchedule?.lessons) return [];

    const groupedLessons = groupLessonsByTime(currentDaySchedule.lessons);
    const formattedSchedule: FormattedScheduleProps[] = [];

    Object.entries(groupedLessons).forEach(([time, lessons]) => {
      const matchingLesson = lessonsTimeNumber.find(
        (el) => el.timeStart === time.substring(0, 8)
      );
      if (matchingLesson) {
        lessons.length == 2
          ? lessons.forEach((lesson, index) => {
              const subgroup =
                getSubgroup(lesson.subject_name) || (index === 0 ? 1 : 2);
              formattedSchedule.push({
                lessonNumber: matchingLesson.pairNumber,
                subgroup,
                lessonId: lesson.lesson_id,
              });
            })
          : lessons.forEach((lesson, index) => {
              const subgroup = getSubgroup(lesson.subject_name);
              formattedSchedule.push({
                lessonNumber: matchingLesson.pairNumber,
                subgroup,
                lessonId: lesson.lesson_id,
              });
            });
      }
    });

    // Группировка данных по lessonNumber
    const groupedData = formattedSchedule.reduce((acc, item) => {
      const { lessonNumber, subgroup, lessonId } = item;

      if (!acc[lessonNumber]) {
        acc[lessonNumber] = {
          lessonNumber,
          subgroups: [],
        };
      }

      acc[lessonNumber].subgroups.push({ subgroup, lessonId });

      return acc;
    }, {} as Record<number, { lessonNumber: number; subgroups: any[] }>);

    // Преобразование объекта группировки в массив
    const result = Object.values(groupedData);

    return result;
  };

  const formattedSchedule = formatSchedule();
  console.log("formattedSchedule", formattedSchedule);
  console.log(students);

  // Параметры пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(students.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = students.slice(startIndex, startIndex + rowsPerPage);
  // Вычисление количества заполнителей для последней страницы
  const placeholdersCount =
    currentPage === totalPages ? rowsPerPage - paginatedData.length : 0;

  // Состояния для отслеживания выбранных студентов и изменений
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [updatedMarks, setUpdatedMarks] = useState<
    Record<number, Record<number, string>>
  >({});
  const [isSingleEditMode, setIsSingleEditMode] = useState(false);

  // Вспомогательные функции
  const getStudentMarks = (studentId: number) => {
    return attendanceLog
      .filter((log) => log.student_id === studentId)
      .reduce((marks, log) => {
        marks[log.lesson_number] = log.status;
        return marks;
      }, {} as Record<number, string>);
  };

  const updateMarksForSelected = (
    lesson: number,
    value: string,
    studentId?: number
  ) => {
    setUpdatedMarks((prev) => {
      const updated = { ...prev };
      console.log(updated);
      if (studentId) {
        if (!updated[studentId]) updated[studentId] = {};
        updated[studentId][lesson] = value;
      } else {
        selectedStudents.forEach((id) => {
          if (!updated[id]) updated[id] = {};
          updated[id][lesson] = value;
        });
      }
      return updated;
    });
  };

  const getChangedMarks = () => {
    const changes: StudentMarkInfoProps[] = [];
    students.forEach((student) => {
      const studentId = student.student_id;
      if (updatedMarks[studentId]) {
        Object.entries(updatedMarks[studentId]).forEach(([lesson, value]) => {
          const originalValue =
            getStudentMarks(studentId)[parseInt(lesson)] || " ";
          if (value !== originalValue) {
            changes.push({
              student_id: studentId,
              day_schedule_id:
                weekSchedule.days[
                  (new Date(currentInfo.currentDate).getDay() + 6) % 7
                ].day_id,
              lesson_schedule_id: parseInt(lesson),
              status: value,
            });
          }
        });
      }
    });
    return changes;
  };

  const saveChanges = async () => {
    const changes = getChangedMarks();
    if (changes.length === 0) {
      console.log("Нет изменений для сохранения.");
      return;
    }
    console.log(changes);
    try {
      const response = await attendanceApi.addAttendanceRecords(changes);
      if (response.success) {
        console.log("Изменения успешно сохранены:", response);
      } else {
        console.error("Ошибка при сохранении изменений:", response.error);
      }
    } catch (error) {
      console.error("Ошибка при отправке запроса:", error);
    }
  };

  // Обработчики событий
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleStudentCheckboxChange = (studentId: number, checked: boolean) => {
    setSelectedStudents((prev) =>
      checked ? [...prev, studentId] : prev.filter((id) => id !== studentId)
    );
  };

  const toggleEditMode = () => {
    setIsSingleEditMode((prev) => !prev);
    setSelectedStudents([]);
  };

  return (
    <div className={styles.container}>
      {/* Кнопка переключения режима */}
      <div className={styles.title}>
        <div className={styles.info}>
          <p>Посещаемость группы {userInfo.group}</p>
          <p className={styles.numStudents}>{students.length} студента</p>
          <p className={styles.numStudents}>{currentInfo.currentDate}</p>
        </div>
        <div className={styles.buttons}>
          <div className={styles.buttonEditMode}>
            <Button onClick={toggleEditMode} variant="auth">
              {isSingleEditMode
                ? "Одиночное редактирование"
                : "Массовое редактирование"}
            </Button>
          </div>
          <div className={styles.buttonSave}>
            <Button onClick={saveChanges} variant="auth">
              Сохранить изменения
            </Button>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={styles.studentCellHead}>
              {!isSingleEditMode && (
                <Checkbox
                  className={styles.studentCheckbox}
                  checked={selectedStudents.length === students.length}
                  onCheckedChange={(checked) =>
                    setSelectedStudents(
                      checked ? students.map((s) => s.student_id) : []
                    )
                  }
                />
              )}
              Студенты
            </TableHead>

            {formattedSchedule.map((lesson) => (
              <TableHead key={lesson.lessonNumber}>
                {lesson.lessonNumber}-я пара
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((student) => {
            const isChecked = selectedStudents.includes(student.student_id);
            const studentMarks = getStudentMarks(student.student_id);
            return (
              <TableRow key={student.student_id} className={styles.tableRow}>
                {!isSingleEditMode && (
                  <TableCell className={styles.studentCell}>
                    <Checkbox
                      className={styles.studentCheckbox}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleStudentCheckboxChange(
                          student.student_id,
                          !!checked
                        )
                      }
                    />
                    {student.surname} {student.name}
                  </TableCell>
                )}
                {isSingleEditMode && (
                  <TableCell className={styles.studentCell}>
                    {student.surname} {student.name}
                  </TableCell>
                )}
                {formattedSchedule.map((lesson) => {
                  const mark =
                    updatedMarks[student.student_id]?.[lesson.lessonNumber] ||
                    studentMarks[lesson.lessonNumber] ||
                    " ";

                  return (
                    <TableCell key={lesson.lessonNumber}>
                      <Select
                        value={mark}
                        onValueChange={(value) => {
                          if (isSingleEditMode) {
                            updateMarksForSelected(
                              lesson.lessonNumber,
                              value,
                              student.student_id
                            );
                          } else if (selectedStudents.length > 0) {
                            updateMarksForSelected(lesson.lessonNumber, value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-[90px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="П">П</SelectItem>
                          <SelectItem value="Б">Б</SelectItem>
                          <SelectItem value="УП">УП</SelectItem>
                          <SelectItem value="Н">Н</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
          {/* Заполнители для последней страницы */}
          {Array.from({ length: placeholdersCount }).map((_, index) => (
            <TableRow
              key={`placeholder-${index}`}
              className={styles.placeholderRow}
            >
              <TableCell colSpan={formattedSchedule.length + 1}>
                &nbsp;
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Пагинация */}
      {students.length != 0 && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
