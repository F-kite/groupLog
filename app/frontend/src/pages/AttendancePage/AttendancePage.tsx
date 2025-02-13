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
    return <div>Загрузка...</div>; // Обработка случая, когда данные еще не загружены
  }

  const lessons = Array.from({ length: 6 }, (_, i) => i + 1); // Номера пар (1-6)

  // Параметры пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Количество строк на странице

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

  return (
    <div className={styles.container}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={styles.studentCellHead}>
              <Checkbox className={styles.studentCheckbox} />
              Студенты
            </TableHead>
            {lessons.map((lesson) => (
              <TableHead key={lesson}>{lesson}-я пара</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((student) => (
            <TableRow key={student.student_id} className={styles.tableRow}>
              <TableCell className={styles.studentCell}>
                <Checkbox className={styles.studentCheckbox} />
                {student.student_surname} {student.student_name}
              </TableCell>
              {lessons.map((lesson) => (
                <TableCell key={lesson}>
                  <Select
                    defaultValue={" "}
                    // defaultValue={student.marks[lesson] || "Н"}
                    onValueChange={(value) => {
                      console.log(
                        `Updated mark for student ${student.student_id}, lesson ${lesson}: ${value}`
                      );
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
              ))}
            </TableRow>
          ))}

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
      <div className="flex justify-center mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
