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
    .from("subjects")
    .select("subject_id")
    .eq("subject_name", subjectName)
    .eq("subject_type", subjectType)
    .single();
  if (!subjectData) {
    const { data } = await supabase
      .from("subjects")
      .insert({
        subject_name: subjectName,
        subject_type: subjectType,
      })
      .select("subject_id")
      .single();
    subjectData = data;
  }
  const subjectId = subjectData.subject_id;

  // Добавить или получить преподавателя
  let { data: teacherData } = await supabase
    .from("teachers")
    .select("teacher_id")
    .eq("teacher_name", teacherName)
    .single();
  if (!teacherData) {
    const { data } = await supabase
      .from("teachers")
      .insert({ teacher_name: teacherName })
      .select("teacher_id")
      .single();
    teacherData = data;
  }
  const teacherId = teacherData.teacher_id;

  // Добавить или получить аудиторию
  let { data: roomData } = await supabase
    .from("rooms")
    .select("room_id")
    .eq("room_number", roomNumber)
    .single();
  if (!roomData) {
    const { data } = await supabase
      .from("rooms")
      .insert({ room_number: roomNumber })
      .select("room_id")
      .single();
    roomData = data;
  }
  const roomId = roomData.room_id;

  // Добавить урок в расписание
  const { data: lessonData, error: lessonError } = await supabase
    .from("lessons_schedule")
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
  await supabase.from("lessons_days_schedule").insert({
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
      .from("groups")
      .select("group_id")
      .eq("group_name", group)
      .single();

    if (!groupData) {
      const { data, error } = await supabase
        .from("groups")
        .insert({ group_name: group })
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
      .from("weeks_schedule")
      .select("week_schedule_id")
      .eq("week_schedule_number", week)
      .eq("group_id", groupId)
      .single();

    if (data) {
      throw new Error("Schedule for this week already exists");
    }

    const { data: weekData, error: weekError } = await supabase
      .from("weeks_schedule")
      .insert({
        week_schedule_number: week,
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
        .from("days_schedule")
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
      await supabase.from("days_weeks_schedule").insert({
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
      .from("groups")
      .select("group_id")
      .eq("group_name", group)
      .single();
    if (groupData) {
      const groupId = groupData.group_id;
      const { data: weekData } = await supabase
        .from("weeks_schedule")
        .select("week_schedule_id")
        .eq("week_schedule_number", week)
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
      .from("groups")
      .select("group_id")
      .eq("group_name", group)
      .single();

    if (gError) {
      throw new Error(gError.message);
    }
    if (!gData) throw new Error("Указанная группа не найдена");
    const groupId = gData.group_id;
    // Получить данные о неделе
    const { data: weekData, error: weekError } = await supabase
      .from("weeks_schedule")
      .select(
        `
        week_schedule_id,
        week_schedule_number,
        start_date,
        end_date,
        groups (group_id, group_name)
      `
      )
      .eq("week_schedule_number", week)
      .eq("group_id", groupId)
      .single();

    if (!weekData)
      return res.status(404).json({ error: "Week does not exists" });
    if (weekError) throw new Error(weekError.message);
    const weekId = weekData.week_schedule_id;
    const { groups: groupData, start_date, end_date } = weekData;

    // Получить дни недели
    const { data: daysData, error: daysError } = await supabase
      .from("days_weeks_schedule")
      .select(
        `
        days_schedule (
          day_schedule_id,
          day_of_week,
          date,
          is_holiday,
          lessons_days_schedule (
            lessons_schedule (
              lesson_schedule_id,
              time_start,
              time_end,
              subjects (subject_name, subject_type),
              teachers (teacher_name),
              rooms (room_number)
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
      weekId: weekData.week_schedule_id,
      weekNumber: weekData.week_schedule_number,
      groupName: groupData.group_name,
      startDate: start_date,
      endDate: end_date,
      days: daysData.map((day) => ({
        dayId: day.days_schedule.day_schedule_id,
        dayOfWeek: day.days_schedule.day_of_week,
        date: day.days_schedule.date,
        isHoliday: day.days_schedule.is_holiday,
        lessons: day.days_schedule.lessons_days_schedule.map((lessonEntry) => {
          const lesson = lessonEntry.lessons_schedule;
          return {
            lessonId: lesson.lesson_schedule_id,
            timeStart: lesson.time_start,
            timeEnd: lesson.time_end,
            subjectName: lesson.subjects.subject_name,
            subjectType: lesson.subjects.subject_type,
            teacherName: lesson.teachers.teacher_name,
            roomNumber: lesson.rooms.room_number,
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
      .from("groups")
      .select("group_id")
      .eq("group_name", group)
      .single();

    if (gError) {
      throw new Error(gError.message);
    }
    if (!gData) throw new Error("Group not found");
    const groupId = gData.group_id;

    // Получение данных о неделе
    const { data: weekData, error: weekError } = await supabase
      .from("weeks_schedule")
      .select("week_schedule_id")
      .eq("week_schedule_number", week)
      .eq("group_id", groupId)
      .single();

    if (!weekData)
      return res.status(404).json({ error: "Week does not exist" });
    if (weekError) throw new Error(weekError.message);
    const weekId = weekData.week_schedule_id;

    // Получение данных о расписании на указанный день
    const { data: dayData, error: dayError } = await supabase
      .from("days_weeks_schedule")
      .select(
        `
        days_schedule (
          day_schedule_id,
          day_of_week,
          date,
          is_holiday,
          lessons_days_schedule (
            lessons_schedule (
              lesson_schedule_id,
              time_start,
              time_end,
              subjects (subject_name, subject_type),
              teachers (teacher_name),
              rooms (room_number)
            )
          )
        )
      `
      )
      .eq("week_id", weekId)
      .filter("days_schedule.day_of_week", "eq", dayName);

    const dailySchedule = dayData[day - 1];
    if (dayError)
      throw new Error("Ошибка получения данных о дне: " + dayError.message);
    if (!dailySchedule || dailySchedule.days_schedule == null)
      throw new Error("No schedule found for the specified day");

    // Преобразование данных
    const { days_schedule: daySchedule } = dailySchedule;

    const schedule = {
      dayId: daySchedule.day_schedule_id,
      dayOfWeek: daySchedule.day_of_week,
      date: daySchedule.date,
      isHoliday: daySchedule.is_holiday,
      lessons: daySchedule.lessons_days_schedule.map((lessonEntry) => {
        const lesson = lessonEntry.lessons_schedule;
        return {
          lessonId: lesson.lesson_schedule_id,
          timeStart: lesson.time_start,
          timeEnd: lesson.time_end,
          subjectName: lesson.subjects.subject_name,
          subjectType: lesson.subjects.subject_type,
          teacherName: lesson.teachers.teacher_name,
          roomNumber: lesson.rooms.room_number,
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
