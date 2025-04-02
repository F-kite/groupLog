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
  date: string;
  lesson_number: number;
  status: "Б" | "УП" | "Н";
  subject_id: number;
  attendance_log_id: number;
};
