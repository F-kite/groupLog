export type StudentsProps = {
  student_id: number;
  subgroup: number;
  student_surname: string;
  student_name: string;
  student_patronymic: string;
  student_email: string;
  student_phone: string;
  student_tgid: string;
  enrollment_year: number;
  marks: { [key: string]: "Б" | "УП" | "Н" };
};
