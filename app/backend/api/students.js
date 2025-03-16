import supabase from "../supabase/index.js";

// Получить всех студентов
const getAll = async (req, res) => {
  const { data: students, error } = await supabase.from("students").select(`
    student_id,
    groups (group_name),
    subgroup,
    student_name,
    student_surname,
    student_patronymic,
    student_phone,
    student_email,
    student_tgid,
    enrollment_year
  `);

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to fetch students" });
  }

  if (!students || students.length === 0) {
    return res.status(404).json({ error: "Students not found" });
  } else if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to fetch students" });
  } else return res.status(200).json(students);
};

// Получить стдента по ID
const getById = async (req, res) => {
  const { id } = req.params;
  const { data: student, error } = await supabase
    .from("students")
    .select(
      `
    student_id,
    groups (group_name),
    subgroup,
    student_name,
    student_surname,
    student_patronymic,
    student_phone,
    student_email,
    student_tgid,
    enrollment_year
      `
    )
    .eq("student_id", id)
    .single();

  if (!student || student.length === 0) {
    return res.status(404).json({ error: "Student not found" });
  } else if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to fetch student" });
  } else return res.status(200).json(student);
};

// Получить всех студентов по группе
const getByGroup = async (req, res) => {
  const data = req.params.group;

  // Существует ли группа
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("group_id")
    .eq("group_name", data)
    .single();

  if (groupError) {
    return res.status(400).json({ error: "Invalid group. Group not found." });
  }

  const { data: students, error } = await supabase
    .from("students")
    .select(
      `
    student_id,
    subgroup,
    student_name,
    student_surname,
    student_patronymic,
    student_phone,
    student_email,
    student_tgid,
    enrollment_year
      `
    )
    .eq("group_id", group.group_id)
    .order("student_surname", { ascending: true });

  if (!students || students.length === 0) {
    return res.status(404).json({ error: "Students not found" });
  } else if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to fetch students" });
  } else {
    return res.status(200).json(students);
  }
};

// Получить всех студентов по группе
const getStudentsAndAttendancesByGroup = async (req, res) => {
  const data = req.params.group;

  // Существует ли группа
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("group_id")
    .eq("group_name", data)
    .single();

  if (groupError) {
    return res.status(400).json({ error: "Invalid group. Group not found." });
  }

  // Получение текущей даты
  const today = new Date().toISOString().split("T")[0]; // Формат: YYYY-MM-DD

  //Получить ID дня для текущей даты
  const { data: dayIds, error: dayError } = await supabase
    .from("days_schedule")
    .select("day_schedule_id")
    .eq("date", today)
    .single();

  console.log(dayIds);

  if (dayError || !dayIds || dayIds.length === 0) {
    return res
      .status(404)
      .json({ error: "No schedule found for the specified date" });
  }

  const { data: students, error: queryError } = await supabase
    .from("students")
    .select(
      `
    student_id,
    subgroup,
    student_name,
    student_surname,
    student_patronymic,
    attendance_logs (
      lessons_schedule (
        lesson_schedule_id,
        subject_id,
        room_id,
        teacher_id,
        time_start,
        time_end
      ),
      days_schedule(
        day_schedule_id,
        date,
        is_holiday
      ),
      attendance_status
    )
      `
    )
    .eq("group_id", group.group_id)
    //.in("days_schedule.day_schedule_id", toString(dayIds.day_schedule_id)) // Фильтруем по ID дней
    .order("student_surname", { ascending: true });

  if (queryError) {
    console.error(queryError.message);
    return res.status(500).json({ error: "Failed to fetch data" });
  }

  if (!students || students.length === 0) {
    console.log(students);
    return res.status(404).json({ error: "Students not found" });
  } else {
    return res.status(200).json(students);
  }
};

// Добавить массив студентов
const create = async (req, res) => {
  const studentsData = req.body;

  if (!Array.isArray(studentsData) || studentsData.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected an array of students." });
  }

  const group_name = studentsData[0].group_name;

  // Существует ли группа с указанным именем
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("group_id")
    .eq("group_name", group_name)
    .single();

  if (groupError || group.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid group name. Group not found." });
  }

  const updatedStudentsData = studentsData.map((student) => {
    const group_id = group.group_id;
    // Удаляем group_name и добавляем group_id
    const { group_name, ...rest } = student;
    return { ...rest, group_id };
  });

  const studentNames = updatedStudentsData.map((student) => ({
    student_name: student.student_name,
    student_surname: student.student_surname,
  }));

  // Проверяем, существуют ли уже такие студенты в базе данных
  const { data: existingStudents, error: studentError } = await supabase
    .from("students")
    .select("student_name, student_surname")
    .in(
      "student_name",
      studentNames.map((s) => s.student_name)
    )
    .in(
      "student_surname",
      studentNames.map((s) => s.student_surname)
    );

  if (studentError) {
    console.error(studentError.message);
    return res
      .status(500)
      .json({ error: "Error checking for existing students." });
  }

  // Находим дубликаты
  const duplicateStudents = existingStudents.filter((existingStudent) =>
    studentNames.some(
      (name) =>
        name.student_name === existingStudent.student_name &&
        name.student_surname === existingStudent.student_surname
    )
  );

  if (duplicateStudents.length > 0) {
    return res.status(400).json({
      error: "Some students already exist.",
      duplicates: duplicateStudents,
    });
  }

  const { data, error } = await supabase
    .from("students")
    .insert(updatedStudentsData)
    .select();

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to create students" });
  }

  return res.status(200).json(data);
};

// Обновить данные студента
const update = async (req, res) => {
  try {
    const { group, id } = req.params;
    const studentData = req.body;
    //Существует ли студент
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("student_id", id)
      .single();

    if (!student || student.length === 0) {
      return res.status(400).json({ error: "Student not found" });
    } else if (studentError) {
      console.error(error.message);
      return res.status(500).json({ error: "Error to update student" });
    }

    // Существует ли группа с указанным именем
    const { data: chekGroup, error: chekGroupError } = await supabase
      .from("groups")
      .select("group_id")
      .eq("group_name", group)
      .single();

    if (chekGroupError || chekGroup.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid group name. Group not found." });
    }

    if (studentData.group_name) {
      const group_id = chekGroup.group_id;
      // Удаляем group_name и добавляем group_id
      const { group_name, ...rest } = studentData;
      return { ...rest, group_id };
    }

    //Данные для обновления
    const updateData = {};
    for (const key in studentData) {
      if (studentData[key] !== undefined || studentData[key] !== student[key]) {
        updateData[key] = studentData[key];
      }
    }

    // Если нет данных для обновления
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No data provided for update" });
    }

    console.log(updateData);
    const { data, error } = await supabase
      .from("students")
      .update(updateData)
      .eq("student_id", id)
      .select()
      .single();

    if (error) {
      console.error(error.message);
      return res.status(404).json({ error: "Student not found!" });
    }

    return res.status(200).json(data);
  } catch (error) {}
};

// Удалить
const remove = async (req, res) => {
  const { id } = req.params;

  // Существует ли с указанным ID
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("*")
    .eq("student_id", id);

  if (!student || student.length === 0) {
    return res.status(400).json({ error: "Invalid id. student not found." });
  } else if (studentError) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to delete student" });
  }

  const { error } = await supabase
    .from("students")
    .delete()
    .eq("student_id", id);

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to delete student" });
  }

  return res.status(204).end();
};

const studentsApi = {
  getAll,
  getById,
  getByGroup,
  create,
  update,
  remove,
};

export default studentsApi;
