export type DailyScheduleProps = {
  dayOfWeek: string;
  date: string;
  isHoliday: boolean;
  lessons: {
    timeStart: string;
    timeEnd: string;
    subjectName: string;
    subjectType: string;
    teacherName: string;
    roomNumber: string;
  }[];
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
      subjectName: "Иностранный язык в профессиональной деятельности",
      subjectType: "пр",
      teacherName: "Юргель Е.В.",
      roomNumber: "0403",
    },
    {
      timeStart: "10:50:00",
      timeEnd: "12:20:00",
      subjectName: "Иностранный язык в профессиональной деятельности",
      subjectType: "пр",
      teacherName: "Завьялова М.Н.",
      roomNumber: "0401",
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
