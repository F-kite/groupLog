import formatDate from "./formatDate.js";

export default function formatSchedule(schedule, weekNumber, nameGroup) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const times = [
    "09:00-10:30",
    "10:50-12:20",
    "13:20-14:50",
    "15:10-16:40",
    "17:00-18:30",
    "18:50-20:20",
  ];

  const dateStart =
    String(schedule[1][0])?.split(" ")[1] +
      " " +
      String(schedule[1][0])?.split(" ")[2] || "unknown";
  const dateEnd =
    String(schedule[6][0])?.split(" ")[1] +
      " " +
      String(schedule[6][0])?.split(" ")[2] || "unknown";

  let formattedSchedule = {
    nameGroup: nameGroup,
    weekNumber: weekNumber,
    dateRange: formatDate(`${dateStart}-${dateEnd}`),
  };

  for (let i = 1; i <= 6; i++) {
    let daySchedule = {
      date:
        formatDate(
          String(schedule[i][0])?.split(" ")[1] +
            " " +
            String(schedule[i][0])?.split(" ")[2]
        ) || "unknown",
      lessons: [],
    };

    for (let j = 1; j <= 6; j++) {
      const lessonData = schedule[i][j] || "noles";

      if (typeof lessonData !== "string") {
        console.error(`Unexpected data type for lesson: ${typeof lessonData}`);
        continue;
      }

      const lessonParts = lessonData.split(";").filter(Boolean); // Убираем пустые элементы
      const subjects = [];
      const teachers = [];

      if (lessonParts.length > 2) {
        let filterKeywords = ["пр.", "уч.", "лаб"];

        lessonParts.forEach((part) => {
          if (
            filterKeywords.includes(part.substring(0, 3)) ||
            ((part.includes("1 п/г") || part.includes("2 п/г")) &&
              isNaN(Number(part.substring(part.length - 4))))
          ) {
            subjects.push(part || "noles");
          } else {
            teachers.push(part || "unknown");
          }
        });
      } else {
        subjects.push(lessonParts[0] || "noles");
        teachers.push(lessonParts[1] || "unknown");
      }

      daySchedule.lessons.push({
        lesson: j.toString(),
        time: times[j - 1],
        subject: subjects,
        teacher: teachers,
      });
    }

    formattedSchedule[days[i - 1]] = daySchedule;
  }

  return formattedSchedule;
}
