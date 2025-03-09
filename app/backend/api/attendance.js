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
    .select("student_id")
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
  const { data: logs, error } = await supabase.from("attendance_logs").select(
    `
        attendance_log_id,
        students (student_name, student_surname),
        lessons_schedule (
          subject_id,
          subjects (subject_name),
          time_start,
          time_end
        ),
        days_schedule (day_of_week, date),
        attendance_status
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
        attendance_log_id,
        students (student_name, student_surname),
        lessons_schedule (
          subject_id,
          subjects (subject_name),
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
const attendanceApi = { getAll, getById, create, update, remove };

export default attendanceApi;
