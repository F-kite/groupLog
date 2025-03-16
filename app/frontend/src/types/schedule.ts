export type DailyScheduleLessonProps = {
  timeStart: string;
  timeEnd: string;
  subjectName: string;
  subjectType: string;
  teacherName: string;
  roomNumber: string;
};

export type DailyScheduleProps = {
  dayOfWeek: string;
  date: string;
  isHoliday: boolean;
  lessons: DailyScheduleLessonProps[];
};

export type WeekScheduleProps = {
  weekNumber: number;
  groupName: string;
  startDate: string;
  endDate: string;
  days: DailyScheduleProps[];
};
