export type DailyStatisticsProps = {
  lesson: string;
  time: string;
  attendance: number;
};

export type WeeklyStatisticsProps = {
  date: string;
  day: string;
  attendance: number;
};

export type MonthlyStatisticsProps = {
  fullMonth: string;
  shortMonth: string;
  attendance: number;
};

export type AttendanceStatisticsProps = {
  dailyStatistics: DailyStatisticsProps[];
  weeklyStatistics: WeeklyStatisticsProps[];
  monthlyStatistics: MonthlyStatisticsProps[];
};

export type AttendanceProps = {
  student_id: number;
  attendance_log: Attendance_logProps[];
};

export type Attendance_logProps = {
  date: string;
  status: "Б" | "УП" | "Н" | "П" | "";
  subject_id: number;
  day_id: number;
  lesson_id: number;
  attendance_log_id?: number;
};

export type lessonNumberProps = {
  [key: number]: number;
};
