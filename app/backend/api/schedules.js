import { getParsedSchedule } from "../services/scheduleService.js";
import supabase from "../supabase/index.js";

async function getOrCreateData(
  timeStart,
  timeEnd,
  subjectType,
  subjectName,
  teacherName,
  roomNumber,
  dayId
) {
  // Добавить или получить предмет
  let { data: subjectData } = await supabase
    .from("subject")
    .select("subject_id")
    .eq("name", subjectName)
    .eq("type", subjectType)
    .single();
  if (!subjectData) {
    const { data } = await supabase
      .from("subject")
      .insert({
        name: subjectName,
        type: subjectType,
      })
      .select("subject_id")
      .single();
    subjectData = data;
  }
  const subjectId = subjectData.subject_id;

  // Добавить или получить преподавателя
  let { data: teacherData } = await supabase
    .from("teacher")
    .select("teacher_id")
    .eq("name", teacherName)
    .single();
  if (!teacherData) {
    const { data } = await supabase
      .from("teacher")
      .insert({ name: teacherName })
      .select("teacher_id")
      .single();
    teacherData = data;
  }
  const teacherId = teacherData.teacher_id;

  // Добавить или получить аудиторию
  let { data: roomData } = await supabase
    .from("room")
    .select("room_id")
    .eq("number", roomNumber)
    .single();
  if (!roomData) {
    const { data } = await supabase
      .from("room")
      .insert({ number: roomNumber })
      .select("room_id")
      .single();
    roomData = data;
  }
  const roomId = roomData.room_id;

  // Добавить урок в расписание
  const { data: lessonData, error: lessonError } = await supabase
    .from("lesson_schedule")
    .insert({
      subject_id: subjectId,
      room_id: roomId,
      teacher_id: teacherId,
      time_start: timeStart,
      time_end: timeEnd,
    })
    .select("lesson_schedule_id")
    .single();
  if (lessonError) throw lessonError;
  const lessonId = lessonData.lesson_schedule_id;

  // Связать урок с днем
  await supabase.from("lesson_day_schedule").insert({
    day_id: dayId,
    lesson_id: lessonId,
  });

  return true;
}

// Функция обработки расписания
async function processSchedule(schedule) {
  function formatDate(dateString) {
    const [day, month, year] = dateString.split(".");
    return `${year}-${month}-${day}`;
  }
  try {
    const { group, week, dateRange, days } = schedule;

    // Получить или создать группу
    const { data: groupData, error: groupError } = await supabase
      .from("group")
      .select("group_id")
      .eq("name", group)
      .single();

    if (!groupData) {
      const { data, error } = await supabase
        .from("group")
        .insert({ name: group })
        .select("group_id")
        .single();
      if (error) throw error;
      groupData = data;
    }
    const groupId = groupData.group_id;

    // Получить или добавить неделю расписания
    let [startDate, endDate] = dateRange.split("-");
    startDate = formatDate(startDate);
    endDate = formatDate(endDate);

    let { data } = await supabase
      .from("week_schedule")
      .select("week_schedule_id")
      .eq("week_number", week)
      .eq("group_id", groupId)
      .single();

    if (data) {
      throw new Error("Schedule for this week already exists");
    }

    const { data: weekData, error: weekError } = await supabase
      .from("week_schedule")
      .insert({
        week_number: week,
        group_id: groupId,
        start_date: startDate,
        end_date: endDate,
      })
      .select("week_schedule_id")
      .single();
    if (weekError) throw weekError;

    const weekId = weekData.week_schedule_id;

    // Обработка дней расписания
    for (const day of days) {
      const isHoliday = day.lessons.length === 0;

      // Добавить день в таблицу days_schedule
      const { data: dayData, error: dayError } = await supabase
        .from("day_schedule")
        .insert({
          day_of_week: day.day,
          date: formatDate(day.date),
          is_holiday: isHoliday,
        })
        .select("day_schedule_id")
        .single();
      if (dayError) throw dayError;
      const dayId = dayData.day_schedule_id;

      // Связать день с неделей
      await supabase.from("day_week_schedule").insert({
        week_id: weekId,
        day_id: dayId,
      });

      if (isHoliday) continue;

      // Обработка уроков
      for (const lesson of day.lessons) {
        const [timeStart, timeEnd] = lesson.time.split("-");

        if (lesson.subject.length == lesson.teacher.length) {
          for (let i = 0; i < lesson.subject.length; i++) {
            const subjectType = lesson.type;
            const subjectName = lesson.subject[i];
            const teacherName = lesson.teacher[i]
              .replace(/^\d\s?п\/г\s?/, "")
              .trim();
            const roomNumber = lesson.room[i];

            await getOrCreateData(
              timeStart,
              timeEnd,
              subjectType,
              subjectName,
              teacherName,
              roomNumber,
              dayId
            );
          }
        } else if (lesson.subject.length == 1 && lesson.teacher.length > 1) {
          for (let i = 0; i < lesson.teacher.length; i++) {
            const subjectType = lesson.type;
            const subjectName = lesson.subject[0];
            const teacherName = lesson.teacher[i]
              .replace(/^\d\s?п\/г\s?/, "")
              .trim();
            const roomNumber = lesson.room[i];

            await getOrCreateData(
              timeStart,
              timeEnd,
              subjectType,
              subjectName,
              teacherName,
              roomNumber,
              dayId
            );
          }
        }
      }
    }
    return "Succesful process!";
  } catch (error) {
    console.error(error);
    return "Error";
  }
}

//Добавить расписание в бд
const createSchedule = async (req, res) => {
  const { week, group } = req.params;

  if (isNaN(week) || week < 1 || week > 26) {
    return res.status(400).json({ error: "Invalid week number" });
  }

  try {
    const { data: groupData } = await supabase
      .from("group")
      .select("group_id")
      .eq("name", group)
      .single();
    if (groupData) {
      const groupId = groupData.group_id;
      const { data: weekData } = await supabase
        .from("week_schedule")
        .select("week_schedule_id")
        .eq("week_number", week)
        .eq("group_id", groupId)
        .single();
      if (weekData) {
        return res
          .status(500)
          .json({ error: "Schedule for this week already exists" });
      }
    }

    const schedule = await getParsedSchedule(week, group);
    if (!schedule) {
      return res
        .status(500)
        .json({ error: "Failed to create schedule, not schedule" });
    }
    await processSchedule(schedule);
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

//Получить расписание из бд
const getWeeklySchedule = async (req, res) => {
  try {
    const { group, week } = req.params;
    const { data: gData, error: gError } = await supabase
      .from("group")
      .select("group_id")
      .eq("name", group)
      .single();

    if (gError || !gData) {
      console.error("Group not found:", gError?.message || "Unknown error");
      return res.status(404).json({ error: "Group not found" });
    }

    const groupId = gData.group_id;
    // Получить данные о неделе
    const { data: weekData, error: weekError } = await supabase
      .from("week_schedule")
      .select(
        `
        week_schedule_id,
        week_number,
        start_date,
        end_date,
        group (group_id, name)
      `
      )
      .eq("week_number", week)
      .eq("group_id", groupId)
      .single();

    if (!weekData)
      return res.status(404).json({ error: "Week does not exists" });
    if (weekError) throw new Error(weekError.message);
    const weekId = weekData.week_schedule_id;
    const { group: groupData, start_date, end_date } = weekData;

    // Получить дни недели
    const { data: daysData, error: daysError } = await supabase
      .from("day_week_schedule")
      .select(
        `
        day_schedule (
          day_schedule_id,
          day_of_week,
          date,
          is_holiday,
          lesson_day_schedule (
            lesson_schedule (
              lesson_schedule_id,
              time_start,
              time_end,
              subject (name, type),
              teacher (name),
              room (number)
            )
          )
        )
      `
      )
      .eq("week_id", weekId);

    if (daysError)
      throw new Error("Ошибка получения данных о днях: " + daysError.message);
    if (!daysData || daysData.length === 0)
      throw new Error("Нет данных о днях для указанной недели");

    // Преобразование данных
    const schedule = {
      week_id: weekData.week_schedule_id,
      week_number: weekData.week_number,
      group_name: groupData.name,
      start_date: start_date,
      end_date: end_date,
      days: daysData.map((day) => ({
        day_id: day.day_schedule.day_schedule_id,
        day_of_week: day.day_schedule.day_of_week,
        date: day.day_schedule.date,
        is_holiday: day.day_schedule.is_holiday,
        lessons: day.day_schedule.lesson_day_schedule.map((lessonEntry) => {
          const lesson = lessonEntry.lesson_schedule;
          return {
            lesson_id: lesson.lesson_schedule_id,
            time_start: lesson.time_start,
            time_end: lesson.time_end,
            subject_name: lesson.subject.name,
            subject_type: lesson.subject.type,
            teacher_name: lesson.teacher.name,
            room_number: lesson.room.number,
          };
        }),
      })),
    };

    return res.status(200).json(schedule);
  } catch (err) {
    console.error("Ошибка получения расписания:", err);
    res.status(500).json({ error: err.message });
  }
};

const getDailySchedule = async (req, res) => {
  try {
    const { group, week, day } = req.params; // Получение параметров из URL
    const dayOfWeekMap = {
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    };

    const dayName = dayOfWeekMap[day];
    if (!dayName) {
      return res.status(400).json({ error: "Invalid day parameter" });
    }

    // Получение ID группы
    const { data: gData, error: gError } = await supabase
      .from("group")
      .select("group_id")
      .eq("name", group)
      .single();

    if (gError) {
      throw new Error(gError.message);
    }
    if (!gData) throw new Error("Group not found");
    const groupId = gData.group_id;

    // Получение данных о неделе
    const { data: weekData, error: weekError } = await supabase
      .from("week_schedule")
      .select("week_schedule_id")
      .eq("week_number", week)
      .eq("group_id", groupId)
      .single();

    if (!weekData)
      return res.status(404).json({ error: "Week does not exist" });
    if (weekError) throw new Error(weekError.message);
    const weekId = weekData.week_schedule_id;

    // Получение данных о расписании на указанный день
    const { data: dayData, error: dayError } = await supabase
      .from("day_week_schedule")
      .select(
        `
        day_schedule (
          day_schedule_id,
          day_of_week,
          date,
          is_holiday,
          lesson_day_schedule (
            lesson_schedule (
              lesson_schedule_id,
              time_start,
              time_end,
              subject (name, type),
              teacher (name),
              room (number)
            )
          )
        )
      `
      )
      .eq("week_id", weekId)
      .filter("day_schedule.day_of_week", "eq", dayName);

    const dailySchedule = dayData[day - 1];
    if (dayError)
      throw new Error("Ошибка получения данных о дне: " + dayError.message);
    if (!dailySchedule || dailySchedule.day_schedule == null)
      throw new Error("No schedule found for the specified day");

    // Преобразование данных
    const { day_schedule: daySchedule } = dailySchedule;

    const schedule = {
      day_id: daySchedule.day_schedule_id,
      day_of_Week: daySchedule.day_of_week,
      date: daySchedule.date,
      is_holiday: daySchedule.is_holiday,
      lessons: daySchedule.lesson_day_schedule.map((lessonEntry) => {
        const lesson = lessonEntry.lesson_schedule;
        return {
          lesson_id: lesson.lesson_schedule_id,
          time_start: lesson.time_start,
          time_end: lesson.time_end,
          subject_name: lesson.subject.name,
          subject_type: lesson.subject.type,
          teacher_name: lesson.teacher.name,
          room_number: lesson.room.number,
        };
      }),
    };

    return res.status(200).json(schedule);
  } catch (err) {
    console.error("Ошибка получения расписания на день:", err);
    res.status(500).json({ error: err.message });
  }
};

const scheduleApi = { createSchedule, getWeeklySchedule, getDailySchedule };

export default scheduleApi;
