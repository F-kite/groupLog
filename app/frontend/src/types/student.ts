export type StudentsProps = {
  student_id: number;
  subgroup: number;
  surname: string;
  name: string;
  patronymic?: string;
  email?: string;
  phone?: string;
  tgid?: string;
  enrollment_year: number;
};

export type StudentMarkInfoProps = {
  student_id: number;
  lesson_schedule_id: number;
  status: string;
  day_schedule_id: number;
};
