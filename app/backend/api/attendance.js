import supabase from "../supabase/index.js";

const create = async (req, res) => {
  const {
    student_id,
    lessons_schedule_id,
    attendance_status,
    day_schedule_id,
  } = req.body;

  // Проверка существования студента
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("student_id, group_id")
    .eq("student_id", student_id)
    .single();

  if (studentError || !student) {
    return res.status(400).json({ error: "Student not found" });
  }

  // Проверка существования занятия
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons_schedule")
    .select("lesson_schedule_id")
    .eq("lesson_schedule_id", lessons_schedule_id)
    .single();

  if (lessonError || !lesson) {
    return res.status(400).json({ error: "Lesson not found" });
  }

  // Проверка существования дня расписания
  const { data: day, error: dayError } = await supabase
    .from("days_schedule")
    .select("day_schedule_id")
    .eq("day_schedule_id", day_schedule_id)
    .single();

  if (dayError || !day) {
    return res.status(400).json({ error: "Day schedule not found" });
  }

  // Проверка существования недели расписания
  const { data: week, error: weekError } = await supabase
    .from("weeks_schedule")
    .select("week_schedule_id")
    .eq("group_id", student.group_id)
    .single();

  if (weekError || !day) {
    return res.status(400).json({ error: "Week schedule not found" });
  }

  // Проверка сопоставления дня с неделей
  const { data: checkDayWeek, error: checkDayWeekError } = await supabase
    .from("days_weeks_schedule")
    .select("*")
    .eq("week_id", week.week_schedule_id)
    .eq("day_id", day_schedule_id)
    .single();

  if (checkDayWeekError || !checkDayWeek) {
    return res.status(400).json({ error: "There is no day on the week" });
  }

  // Проверка сопоставления занятия с днем
  const { data: checkLesDay, error: checkLesDayError } = await supabase
    .from("lessons_days_schedule")
    .select("*")
    .eq("day_id", day_schedule_id)
    .eq("lesson_id", lessons_schedule_id)
    .single();

  if (checkLesDayError || !checkLesDay) {
    return res
      .status(400)
      .json({ error: "There is no lesson on the selected day" });
  }

  // Добавление записи о посещаемости
  const { data, error } = await supabase
    .from("attendance_logs")
    .insert({
      student_id,
      lessons_schedule_id,
      attendance_status,
      day_schedule_id,
    })
    .select();

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to create attendance log" });
  }

  return res.status(200).json(data);
};

const getAll = async (req, res) => {
  const { data: logs, error } = await supabase.from("students").select(
    `
        student_id,
        student_name,
        student_surname,
        attendance_logs (
          attendance_log_id,
          lessons_schedule (
            subject_id,
            subjects (subject_name,subject_type),
            time_start,
            time_end
          ),
          days_schedule (day_of_week, date),
          attendance_status
        )

        `
  );

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to fetch attendance logs" });
  }

  if (!logs || logs.length === 0) {
    return res.status(404).json({ error: "Attendance logs not found" });
  }

  return res.status(200).json(logs);
};

const getById = async (req, res) => {
  const { id } = req.params;

  const { data: log, error } = await supabase
    .from("attendance_logs")
    .select(
      `
        students (student_name, student_surname),
        lessons_schedule (
          subject_id,
          subjects (subject_name,subject_type),
          time_start,
          time_end
        ),
        days_schedule (day_of_week, date),
        attendance_status
        `
    )
    .eq("attendance_log_id", id)
    .single();

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to fetch attendance log" });
  }

  if (!log) {
    return res.status(404).json({ error: "Attendance log not found" });
  }

  return res.status(200).json(log);
};

const getByGroup = async (req, res) => {
  const { group } = req.params;
  const { date } = req.query;
  let formattedDate;
  if (!date) {
    formattedDate = new Date().toISOString().split("T")[0]; // Формат: YYYY-MM-DD
  } else if (date !== "all") {
    formattedDate = `${date.substring(0, 4)}-${date.substring(
      4,
      6
    )}-${date.substring(6, 8)}`;
  }

  console.log(formattedDate);

  // Существует ли группа
  const { data: groupData, error: groupError } = await supabase
    .from("groups")
    .select("group_id")
    .eq("group_name", group)
    .single();

  if (groupError || !groupData) {
    return res.status(400).json({ error: "Invalid group. Group not found." });
  }

  const groupId = groupData.group_id;

  // Получение данных о студентах и их посещаемости

  const { data: attendance, error } = await supabase
    .from("students")
    .select(
      `
        student_id,
        student_name,
        student_surname,
        attendance_logs (
          attendance_log_id,
          lessons_schedule (
            subject_id,
            subjects (subject_name,subject_type),
            time_start,
            time_end
          ),
          days_schedule (day_of_week, date),
          attendance_status
        )
      `
    )
    .eq("group_id", groupId);
  // .eq("days_schedule.date", formattedDate);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch attendance data" });
  }

  if (!attendance || attendance.length === 0) {
    return res
      .status(404)
      .json({ error: "No students or attendance logs found" });
  }

  return res.status(200).json(attendance);
};

const getByStudent = async (req, res) => {
  const { student } = req.params;

  try {
    // Проверяем существование студента
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("student_id")
      .eq("student_id", student)
      .single();

    if (studentError || !studentData) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Получаем данные о посещаемости студента
    const { data: attendanceLogs, error: attendanceError } = await supabase
      .from("attendance_logs")
      .select(
        `
        attendance_log_id,
        lessons_schedule (
          subject_id,
          subjects (subject_name, subject_type),
          time_start,
          time_end
        ),
        days_schedule (day_of_week, date),
        attendance_status
        `
      )
      .eq("student_id", student);

    if (attendanceError) {
      console.error(attendanceError);
      return res.status(500).json({ error: "Failed to fetch attendance logs" });
    }

    if (!attendanceLogs || attendanceLogs.length === 0) {
      return res
        .status(404)
        .json({ error: "No attendance logs found for this student" });
    }

    return res.status(200).json(attendanceLogs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { attendance_status, day_schedule_id } = req.body;

  // Валидация входных данных
  if (!attendance_status || !day_schedule_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Проверка существования записи
  const { data: log, error: logError } = await supabase
    .from("attendance_logs")
    .select("attendance_log_id")
    .eq("attendance_log_id", id)
    .single();

  if (logError || !log) {
    return res.status(400).json({ error: "Attendance log not found" });
  }

  // Проверка существования дня расписания
  const { data: day, error: dayError } = await supabase
    .from("days_schedule")
    .select("day_schedule_id")
    .eq("day_schedule_id", day_schedule_id)
    .single();

  if (dayError || !day) {
    return res.status(400).json({ error: "Day schedule not found" });
  }

  // Обновление записи
  const { data, error } = await supabase
    .from("attendance_logs")
    .update({ attendance_status, day_schedule_id })
    .eq("attendance_log_id", id)
    .select();

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to update attendance log" });
  }

  return res.status(200).json(data);
};

const remove = async (req, res) => {
  const { id } = req.params;

  // Проверка существования записи
  const { data: log, error: logError } = await supabase
    .from("attendance_logs")
    .select("attendance_log_id")
    .eq("attendance_log_id", id);

  if (logError || !log) {
    return res.status(400).json({ error: "Attendance log not found" });
  }

  // Удаление записи
  const { error } = await supabase
    .from("attendance_logs")
    .delete()
    .eq("attendance_log_id", id);

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to delete attendance log" });
  }

  return res.status(204).end();
};
const attendanceApi = {
  getAll,
  getById,
  getByGroup,
  getByStudent,
  create,
  update,
  remove,
};

export default attendanceApi;
