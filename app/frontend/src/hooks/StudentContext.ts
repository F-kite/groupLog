import { createContext } from "react";

export interface Students {
  student_id: number;
  subgroup: number;
  student_surname: string;
  student_name: string;
  student_patronymic: string;
  student_email: string;
  student_phone: string;
  student_tgid: string;
  marks: { [key: string]: "Б" | "УП" | "Н" };
}

export const StudentContext = createContext<Students[] | null>(null);
