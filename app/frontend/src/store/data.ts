export type UserProps = {
  role: string;
  userName: string;
  userEmail: string;
};

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

export const UserInfo: UserProps = {
  role: "student",
  userName: "Ильичев Виталий",
  userEmail: "ilichevv_v845@mail.ru",
};

export const dailySchedule: DailyScheduleProps = {
  dayOfWeek: "Monday",
  date: "2025-01-13",
  isHoliday: false,
  lessons: [
    {
      timeStart: "09:00:00",
      timeEnd: "10:30:00",
      subjectName: "Разработка кода информационных систем - 2 п/г",
      subjectType: "лаб",
      teacherName: "Ерошевич К.В.",
      roomNumber: "5514",
    },
    {
      timeStart: "10:50:00",
      timeEnd: "12:20:00",
      subjectName: "Внедрение информационной системы - 1 п/г",
      subjectType: "лаб",
      teacherName: "Дементьева Ю.С.",
      roomNumber: "5506",
    },
    {
      timeStart: "10:50:00",
      timeEnd: "12:20:00",
      subjectName: "Разработка кода информационных систем - 2 п/г",
      subjectType: "лаб",
      teacherName: "Ерошевич К.В.",
      roomNumber: "5514",
    },
    {
      timeStart: "13:20:00",
      timeEnd: "14:50:00",
      subjectName: "Внедрение информационной системы",
      subjectType: "л",
      teacherName: "Дементьева Ю.С.",
      roomNumber: "5505",
    },
    {
      timeStart: "15:10:00",
      timeEnd: "16:40:00",
      subjectName: "Тестирование информационных систем",
      subjectType: "л",
      teacherName: "Романова В.В.",
      roomNumber: "5503",
    },
    {
      timeStart: "17:00:00",
      timeEnd: "18:30:00",
      subjectName: "Тестирование информационных систем - 1 п/г",
      subjectType: "лаб",
      teacherName: "Романова В.В.",
      roomNumber: "5506",
    },
    {
      timeStart: "18:50:00",
      timeEnd: "20:20:00",
      subjectName: "Тестирование информационных систем - 1 п/г",
      subjectType: "лаб",
      teacherName: "Романова В.В.",
      roomNumber: "5506",
    },
  ],
};

export const attendanceStatistics: AttendanceStatisticsProps = {
  dailyStatistics: [
    { lesson: "1 пара", time: "9:00-10:30", attendance: 75 },
    { lesson: "2 пара", time: "10:50-12:20", attendance: 90 },
    { lesson: "3 пара", time: "13:20-14:50", attendance: 85 },
    { lesson: "4 пара", time: "15:10-16:40", attendance: 80 },
    { lesson: "5 пара", time: "17:00-18:30", attendance: 70 },
    { lesson: "6 пара", time: "18:50-20:20", attendance: 20 },
  ],

  weeklyStatistics: [
    { date: "01.01.2025", day: "Пн", attendance: 85 },
    { date: "02.01.2025", day: "Вт", attendance: 88 },
    { date: "03.01.2025", day: "Ср", attendance: 90 },
    { date: "04.01.2025", day: "Чт", attendance: 87 },
    { date: "05.01.2025", day: "Пт", attendance: 82 },
    { date: "06.01.2025", day: "Сб", attendance: 90 },
  ],

  monthlyStatistics: [
    { fullMonth: "Январь", shortMonth: "Янв", attendance: 82 },
    { fullMonth: "Февраль", shortMonth: "Фев", attendance: 85 },
    { fullMonth: "Март", shortMonth: "Мар", attendance: 88 },
    { fullMonth: "Апрель", shortMonth: "Апр", attendance: 87 },
    { fullMonth: "Май", shortMonth: "Май", attendance: 90 },
    { fullMonth: "Июнь", shortMonth: "Июн", attendance: 92 },
    { fullMonth: "Июль", shortMonth: "Июл", attendance: 95 },
    { fullMonth: "Август", shortMonth: "Авг", attendance: 93 },
    { fullMonth: "Сентябрь", shortMonth: "Сен", attendance: 89 },
    { fullMonth: "Октябрь", shortMonth: "Окт", attendance: 86 },
    { fullMonth: "Ноябрь", shortMonth: "Ноя", attendance: 84 },
    { fullMonth: "Декабрь", shortMonth: "Дек", attendance: 83 },
  ],
};

export const communicationWithDeveloper = [
  {
    connection: "Telegram",
    href: "https://t.me/w_ViIl",
    icon: "/icon/telegram_icon.svg",
  },
  {
    connection: "Mail",
    href: "mailto:workhub00@mail.ru",
    icon: "/icon/mail_icon.svg",
  },
];
