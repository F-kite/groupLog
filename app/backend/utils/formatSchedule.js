import formatDate from "./formatDate.js";

function prepareScheduleSkeleton(schedule, weekNumber, groupName) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const dateStart =
    String(schedule[1][0])?.split(" ")[1] +
      " " +
      String(schedule[1][0])?.split(" ")[2] || "unknown";
  const dateEnd =
    String(schedule[6][0])?.split(" ")[1] +
      " " +
      String(schedule[6][0])?.split(" ")[2] || "unknown";

  const dateRange = formatDate(`${dateStart}-${dateEnd}`);

  return {
    group: groupName,
    week: weekNumber,
    dateRange,
    days: days.map((day, index) => ({
      day: day,
      date:
        formatDate(
          String(schedule[index + 1][0])?.split(" ")[1] +
            " " +
            String(schedule[index + 1][0])?.split(" ")[2]
        ) || "unknown",
      lessons: [],
    })),
  };
}

function parseLessonData(lessonData) {
  let [typeAndSubject, teacherAndRoom] = [];
  if (lessonData === "noles") return null;

  const parts = lessonData.split(";").filter(Boolean); // Разбиваем на части

  if (parts.length == 4) {
    typeAndSubject = [parts[0], parts[2]];
    teacherAndRoom = [parts[1], parts[3]];
  } else if (parts.length == 3) {
    typeAndSubject = [parts[0]];
    teacherAndRoom = [parts[1], parts[2]];
  } else {
    typeAndSubject = [parts[0]];
    teacherAndRoom = [parts[1]];
  }

  let type = "unknown";
  let subject = [];
  let teacher = [];
  let room = [];

  // Определяем тип и предмет
  const lessonTypes = ["л.", "пр.", "уч.пр.", "лаб.", "конс.", "экз."];
  typeAndSubject.map((el) => {
    for (const lessonType of lessonTypes) {
      if (el?.startsWith(lessonType)) {
        type = lessonType.replace(/\./g, ""); // Убираем точку
        subject.push(el?.substring(lessonType.length).trim() || "unknown");
        break;
      }
    }

    if (typeAndSubject.length == 2 && !subject[0].includes(el.substring(4))) {
      subject.push(el?.trim() || "unknown");
    }
  });

  // Разделяем преподавателя и кабинет
  teacherAndRoom.map((el) => {
    let value = null;
    if (el) {
      const roomMatch = el.match(/\d{4}[а-я]|\d{4}|\d{1} лек|лыж.б/);
      if (roomMatch) {
        room.push(roomMatch[0]);
        value = roomMatch[0];
        teacher.push(el.replace(value, "").trim());
      } else {
        teacher.push(el.trim()); // Если кабинет не найден
      }
    }
  });

  return { type, subject, teacher, room };
}

export default function formatSchedule(rawSchedule, weekNumber, groupName) {
  const skeleton = prepareScheduleSkeleton(rawSchedule, weekNumber, groupName);
  const times = [
    "09:00-10:30",
    "10:50-12:20",
    "13:20-14:50",
    "15:10-16:40",
    "17:00-18:30",
    "18:50-20:20",
  ];

  skeleton.days.forEach((day, index) => {
    rawSchedule[index + 1]?.slice(1).forEach((lesson, lessonIndex) => {
      const parsedLesson = parseLessonData(lesson);
      if (parsedLesson) {
        day.lessons.push({
          lesson: (lessonIndex + 1).toString(),
          time: times[lessonIndex],
          ...parsedLesson,
        });
      }
    });
  });

  return skeleton;
}
