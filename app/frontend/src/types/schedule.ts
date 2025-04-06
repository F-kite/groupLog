export type DailyScheduleLessonProps = {
  lesson_id: number;
  time_start: string;
  time_end: string;
  subject_name: string;
  subject_type: string;
  teacher_name: string;
  room_number: string;
};

export type DailyScheduleProps = {
  day_id: number;
  day_of_week: string;
  date: string;
  is_holiday: boolean;
  lessons: DailyScheduleLessonProps[];
};

export type WeekScheduleProps = {
  week_number: number;
  group_name: string;
  start_date: string;
  end_date: string;
  days: DailyScheduleProps[];
};
