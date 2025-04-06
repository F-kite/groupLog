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
import { lessonNumberProps } from "@/types/attendance";
import { lessonsTimeNumber } from "@/store/data";
import attendanceApi from "@/utils/api/attendance";
import styles from "./styles.module.scss";

export default function AttendanceTable() {
  const context = useContext(MyContext);

  if (!context) {
    throw new Error("MyContext must be used within a MyProvider");
  }

  const { baseUserInfo, students, weekSchedule, attendanceLog } = context;

  const studentMarkInfoArray: StudentMarkInfoProps[] = [];

  const dayNumber = (new Date(baseUserInfo.currentDate).getDay() + 6) % 7;
  const currentDaySchedule = weekSchedule.days[dayNumber];

  const lessonNumbers: lessonNumberProps = {};
  const lessons =
    currentDaySchedule && currentDaySchedule.lessons
      ? Array.from({ length: currentDaySchedule.lessons.length }, (_, i) => i)
      : []; // Порядковые номера пар

  const numberScheduledLesson: number[] = [];
  //Нумерация пар в соот с расписанием
  currentDaySchedule && currentDaySchedule.lessons
    ? currentDaySchedule.lessons.map((lesson) => {
        lessonsTimeNumber.map((el) => {
          if (el.timeStart == lesson.time_start)
            numberScheduledLesson.push(el.pairNumber);
        });
      })
    : [];

  lessons.map((lesson) => {
    lessonNumbers[lesson] = currentDaySchedule.lessons[lesson].lesson_id;
  });

  console.log("CURRENT_DAY_SCHEDULE", currentDaySchedule);

  // Параметры пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Количество строк на странице

  // Состояния для отслеживания выбранных студентов и изменений
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [updatedMarks, setUpdatedMarks] = useState<
    Record<number, Record<number, string>>
  >({});

  // Режим работы: true - изменение одного студента, false - изменение нескольких студентов
  const [isSingleEditMode, setIsSingleEditMode] = useState(false);

  // Вычисление данных для текущей страницы
  const totalPages = Math.ceil(students.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = students.slice(startIndex, startIndex + rowsPerPage);

  // Вычисление количества заполнителей для последней страницы
  const placeholdersCount =
    currentPage === totalPages ? rowsPerPage - paginatedData.length : 0;

  // Обработчики пагинации
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Обработчик изменения состояния чекбокса студента
  const handleStudentCheckboxChange = (studentId: number, checked: boolean) => {
    if (checked) {
      setSelectedStudents((prev) => [...prev, studentId]);
    } else {
      setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
    }
  };

  // Вспомогательная функция для получения отметок студента
  const getStudentMarks = (studentId: number) => {
    const studentLogs = attendanceLog.filter(
      (log: any) => log.student_id === studentId
    );
    return studentLogs.reduce((marks: Record<number, string>, log: any) => {
      marks[log.lesson_number] = log.status; // Предполагается, что у лога есть поле lesson_number
      return marks;
    }, {});
  };

  // Функция для обновления отметок у выбранных студентов
  const updateMarksForSelected = (
    lesson: number,
    value: string,
    studentId?: number
  ) => {
    const updatedMarksCopy = { ...updatedMarks };

    if (studentId) {
      // Изменение только одного студента
      if (!updatedMarksCopy[studentId]) {
        updatedMarksCopy[studentId] = {};
      }
      updatedMarksCopy[studentId][lesson] = value;
    } else {
      // Проверка, есть ли выбранные студенты
      if (selectedStudents.length === 0) {
        alert("Пожалуйста, выберите хотя бы одного студента."); // Показываем уведомление
        return; // Выходим из функции, если студенты не выбраны
      }

      // Изменение всех выбранных студентов
      selectedStudents.forEach((studentId) => {
        if (!updatedMarksCopy[studentId]) {
          updatedMarksCopy[studentId] = {};
        }
        updatedMarksCopy[studentId][lesson] = value;
      });
    }

    setUpdatedMarks(updatedMarksCopy);
  };

  // Функция для получения измененных отметок
  const getChangedMarks = () => {
    students.forEach((student) => {
      const studentId = student.student_id;
      if (updatedMarks[studentId]) {
        Object.entries(updatedMarks[studentId]).forEach(([lesson, value]) => {
          const lessonNum = parseInt(lesson);
          const originalValue = getStudentMarks(studentId)[lessonNum] || " ";
          if (value !== originalValue) {
            studentMarkInfoArray.push({
              student_id: studentId,
              day_schedule_id: currentDaySchedule.day_id,
              lesson_schedule_id: lessonNumbers[lessonNum],
              status: value,
            });
          }
        });
      }
    });

    return studentMarkInfoArray;
  };

  // Переключение режима работы
  const toggleEditMode = () => {
    setIsSingleEditMode((prev) => !prev);
    setSelectedStudents([]); // Очищаем выбранных студентов при переключении режима
  };

  // Сохранение изменений
  const saveChanges = async () => {
    getChangedMarks();

    if (studentMarkInfoArray.length === 0) {
      console.log("Нет изменений для сохранения.");
      return;
    }

    //здесь нужно делать запрос в бд
    console.log("Измененные отметки:", [...studentMarkInfoArray]);

    const response = await attendanceApi.addAttendanceRecords(
      studentMarkInfoArray
    );

    if (response.success) {
      console.log(response);
    }

    if (response.error) {
      console.error(response.error);
    }

    studentMarkInfoArray.length = 0;
  };
  return (
    <div className={styles.container}>
      {/* Кнопка переключения режима */}
      <div className={styles.title}>
        <div className={styles.info}>
          <p>Посещаемость группы {baseUserInfo.currentGroup}</p>
          <p className={styles.numStudents}>{students.length} студента</p>
          <p className={styles.numStudents}>{baseUserInfo.currentDate}</p>
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

            {numberScheduledLesson.map((lesson) => (
              <TableHead key={lesson}>{lesson}-я пара</TableHead>
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
                {lessons.map((lesson) => {
                  const mark =
                    updatedMarks[student.student_id]?.[lesson] ||
                    studentMarks[lesson] ||
                    " ";

                  return (
                    <TableCell key={lesson}>
                      <Select
                        value={mark}
                        onValueChange={(value) => {
                          if (isSingleEditMode) {
                            updateMarksForSelected(
                              lesson,
                              value,
                              student.student_id
                            );
                          } else if (selectedStudents.length > 0) {
                            updateMarksForSelected(lesson, value);
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
              <TableCell colSpan={lessons.length + 1}>&nbsp;</TableCell>
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
