import { useContext, useState } from "react";
import { StudentContext } from "@/hooks/StudentContext";
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
import styles from "./styles.module.scss";

export default function AttendanceTable() {
  const students = useContext(StudentContext);

  if (!students) {
    return <div>Загрузка...</div>;
  }

  const lessons = Array.from({ length: 6 }, (_, i) => i + 1); // Номера пар (1-6)

  // Параметры пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Количество строк на странице

  // Состояния для отслеживания выбранных студентов
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
      // Изменение всех выбранных студентов
      selectedStudents.forEach((studentId) => {
        if (!updatedMarksCopy[studentId]) {
          updatedMarksCopy[studentId] = {};
        }
        updatedMarksCopy[studentId][lesson] = value;
      });
    }

    setUpdatedMarks(updatedMarksCopy);

    console.log(
      `Updated marks for lesson: ${lesson}, value: ${value}, studentId: ${
        studentId || "all"
      }`
    );
  };

  // Переключение режима работы
  const toggleEditMode = () => {
    setIsSingleEditMode((prev) => !prev);
    setSelectedStudents([]); // Очищаем выбранных студентов при переключении режима
  };

  // Сохранение изменений
  const saveСhanges = () => {};

  return (
    <div className={styles.container}>
      {/* Кнопка переключения режима */}
      <div className={styles.title}>
        <div className={styles.info}>
          <p>Посещаемость группы ИСт-221</p>
          <p className={styles.numStudents}>{students.length} студента</p>
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
            <Button onClick={saveСhanges} variant="auth">
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

            {lessons.map((lesson) => (
              <TableHead key={lesson}>{lesson}-я пара</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((student) => {
            const isChecked = selectedStudents.includes(student.student_id);

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
                    {student.student_surname} {student.student_name}
                  </TableCell>
                )}
                {isSingleEditMode && (
                  <TableCell className={styles.studentCell}>
                    {student.student_surname} {student.student_name}
                  </TableCell>
                )}
                {lessons.map((lesson) => {
                  const mark =
                    updatedMarks[student.student_id]?.[lesson] ||
                    student.marks?.[lesson] ||
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
