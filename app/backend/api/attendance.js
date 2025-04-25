import supabase from "../supabase/index.js";

const create = async (req, res) => {
  const attendanceData = req.body; // Массив данных о посещаемости

  if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
    return res.status(400).json({ error: "Invalid or empty attendance data" });
  }

  const results = [];
  const errors = [];
  const duplicates = [];

  for (const entry of attendanceData) {
    const { student_id, lesson_schedule_id, status, day_schedule_id } = entry;
    try {
      // Проверка существования студента
      const { data: student, error: studentError } = await supabase
        .from("student")
        .select("student_id, group_id")
        .eq("student_id", student_id)
        .single();

      if (studentError || !student) {
        throw new Error(`Student with ID ${student_id} not found`);
      }

      // Проверка существования занятия
      const { data: lesson, error: lessonError } = await supabase
        .from("lesson_schedule")
        .select("lesson_schedule_id")
        .eq("lesson_schedule_id", lesson_schedule_id)
        .single();

      if (lessonError || !lesson) {
        throw new Error(`Lesson with ID ${lesson_schedule_id} not found`);
      }

      // Проверка существования дня расписания
      const { data: day, error: dayError } = await supabase
        .from("day_schedule")
        .select("day_schedule_id")
        .eq("day_schedule_id", day_schedule_id)
        .single();

      if (dayError || !day) {
        throw new Error(`Day schedule with ID ${day_schedule_id} not found`);
      }

      // Проверка сопоставления занятия с днем
      const { data: checkLesDay, error: checkLesDayError } = await supabase
        .from("lesson_day_schedule")
        .select("*")
        .eq("day_id", day_schedule_id)
        .eq("lesson_id", lesson_schedule_id)
        .single();

      if (checkLesDayError || !checkLesDay) {
        throw new Error(
          `There is no lesson with ID ${lesson_schedule_id} on the selected day with ID ${day_schedule_id}`
        );
      }

      // Проверка на дублирование записи
      const { data: existingRecord, error: existingRecordError } =
        await supabase
          .from("attendance_log")
          .select("attendance_log_id")
          .eq("student_id", student_id)
          .eq("lesson_schedule_id", lesson_schedule_id)
          .eq("day_schedule_id", day_schedule_id)
          .single();

      if (existingRecord) {
        duplicates.push({
          entry,
          message: `This entry already exist and has been skipped`,
        });
        continue;
      }

      // Если все проверки пройдены, добавляем данные в результаты
      results.push({
        student_id,
        lesson_schedule_id,
        status,
        day_schedule_id,
      });
    } catch (error) {
      errors.push({ entry, error: error.message });
    }
  }

  if (errors.length > 0) {
    return res
      .status(400)
      .json({ errors, message: "Some entries failed to process" });
  }
  // вставка данных о посещаемости
  if (results.length > 0) {
    const { data, error } = await supabase
      .from("attendance_log")
      .insert(results)
      .select();

    if (error) {
      console.error(error.message);
      return res
        .status(500)
        .json({ error: "Failed to create attendance logs" });
    }

    return res
      .status(200)
      .json({ message: `Attendance logs created successfully` });
  } else {
    return res.status(406).json({
      message: `There is no data to record, it is possible that it is duplicated.`,
    });
  }
};

const getAll = async (req, res) => {
  const { data: logs, error } = await supabase
    .from("student")
    .select(
      `
        student_id,
        group_id,
        name,
        surname,
        attendance_log (
          attendance_log_id,
          lesson_schedule (
            subject_id,
            subject (name,type),
            time_start,
            time_end
          ),
          day_schedule (day_of_week, date),
          status
        )

        `
    )
    .order("group_id", { ascending: true })
    .order("surname", { ascending: true });

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
    .from("attendance_log")
    .select(
      `
        student (name, surname),
        lesson_schedule (
          subject_id,
          subject (name,type),
          time_start,
          time_end
        ),
        day_schedule (day_of_week, date),
        status
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

//Получение посещаемости студентов конкретной группы (есть необязательный параметр - дата, который указывается в url)
const getByGroup = async (req, res) => {
  const { group } = req.params;
  const { date } = req.query;
  let formattedDate;

  if (!date) {
    formattedDate = new Date().toISOString().split("T")[0]; // Формат: YYYY-MM-DD
  } else if (date !== "no") {
    formattedDate = `${date.substring(0, 4)}-${date.substring(
      4,
      6
    )}-${date.substring(6, 8)}`;
  } else if (date === "no") {
    formattedDate = null;
  }

  // Существует ли группа
  const { data: groupData, error: groupError } = await supabase
    .from("group")
    .select("group_id")
    .eq("name", group)
    .single();

  if (groupError || !groupData) {
    console.error("Group not found:", groupError?.message || "Unknown error");
    return res.status(404).json({ error: "Group not found" });
  }

  const groupId = groupData.group_id;

  // Получаем данные о студентах и их посещаемости
  let query = supabase
    .from("student")
    .select(
      `
          student_id,
          attendance_log (
            attendance_log_id,
            lesson_schedule (
              lesson_schedule_id,
              subject_id,
              time_start
            ),
            day_schedule ( 
            day_schedule_id, date
            ),
            status
          )
        `
    )
    .eq("group_id", groupId);

  if (formattedDate) {
    query = query.filter(
      "attendance_log.day_schedule.date",
      "eq",
      formattedDate
    );
  }

  const { data: attendance, error } = await query;
  if (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).json({ error: error.message });
  }

  if (!attendance || attendance.length === 0) {
    return res
      .status(404)
      .json({ error: "No students or attendance logs found" });
  }

  // Форматирование и фильтрация данных
  const formattedAttendance = attendance.map((student) => {
    const formattedLogs = student.attendance_log
      .filter((log) => log.day_schedule && log.day_schedule.date !== null) //фильтрация отметок по дате
      .map((log) => ({
        date: log.day_schedule?.date || "Unknown",
        status: log.status || "Unknown",
        subject_id: log.lesson_schedule?.subject_id || "Unknown",
        lesson_id: log.lesson_schedule?.lesson_schedule_id || "Unknown",
        day_id: log.day_schedule?.day_schedule_id || "Unknown",
        attendance_log_id: log.attendance_log_id || "Unknown",
      }));

    return {
      student_id: student.student_id,
      attendance_log: formattedLogs,
    };
  });

  return res.status(200).json(formattedAttendance);
};

const getByStudent = async (req, res) => {
  const { student } = req.params;

  try {
    // Проверяем существование студента
    const { data: studentData, error: studentError } = await supabase
      .from("student")
      .select("student_id")
      .eq("student_id", student)
      .single();

    if (studentError || !studentData) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Получаем данные о посещаемости студента
    const { data: attendanceLogs, error: attendanceError } = await supabase
      .from("attendance_log")
      .select(
        `
        attendance_log_id,
        lesson_schedule (
          subject_id,
          subject (name, type),
          time_start,
          time_end
        ),
        day_schedule (day_of_week, date),
        status
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
  const records = req.body;

  // Валидация входных данных
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: "Invalid or empty records array" });
  }

  const errors = [];

  for (const record of records) {
    const { status, day_schedule_id, lesson_schedule_id, student_id } = record;

    try {
      // Валидация полей для каждой записи
      if (!status || !day_schedule_id || !lesson_schedule_id || !student_id) {
        errors.push({
          status,
          day_schedule_id,
          lesson_schedule_id,
          student_id,
          message: "There is error",
        });
        continue;
      }

      // Проверка существования записи
      const { data: log, error: logError } = await supabase
        .from("attendance_log")
        .select("*")
        .eq("student_id", student_id)
        .eq("lesson_schedule_id", lesson_schedule_id)
        .eq("day_schedule_id", day_schedule_id)
        .single();

      if (logError || !log) {
        console.error(logError);
        return res.status(400).json({ error: "Attendance log not found" });
      }

      if (log != null && log.status == status) {
        errors.push({
          oldStatus: log.status,
          newStatus: status,
          day_schedule_id,
          lesson_schedule_id,
          student_id,
          message: "It is not a new record",
        });
        continue;
      }

      // Обновление записи
      const { data, error } = await supabase
        .from("attendance_log")
        .update({ status })
        .eq("attendance_log_id", log.attendance_log_id)
        .select();

      if (error) {
        throw new Error({ error: "Failed to update attendance log" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (errors.length > 0) {
    console.log(errors);
    return res
      .status(200)
      .json({ message: `Attendance log updated partially` });
  }
  return res
    .status(200)
    .json({ message: `Attendance log updated successfully` });
};

const remove = async (req, res) => {
  const { id } = req.params;

  // Проверка существования записи
  const { data: log, error: logError } = await supabase
    .from("attendance_log")
    .select("attendance_log_id")
    .eq("attendance_log_id", id);

  if (logError || !log) {
    return res.status(400).json({ error: "Attendance log not found" });
  }

  // Удаление записи
  const { error } = await supabase
    .from("attendance_log")
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
