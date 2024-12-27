import supabase from "../supabase/index.js";

// Получить всех студентов
const getAll = async (req, res) => {
  const { data: students, error } = await supabase.from("students").select(`
    student_id,
    groups (group_name),
    student_name,
    student_surname,
    student_patronymic,
    student_phone,
    student_email,
    student_tgid
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
    student_name,
    student_surname,
    student_patronymic,
    student_phone,
    student_email,
    student_tgid
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

// Добавить студента
const create = async (req, res) => {
  const studentData = req.body;

  const group_id = studentData.group_id;
  const student_name = studentData.student_name;
  const student_surname = studentData.student_surname;

  // Существует ли группа с указанным ID
  const { data: group, error: curatorError } = await supabase
    .from("groups")
    .select("*")
    .eq("group_id", group_id);

  if (curatorError) {
    return res
      .status(400)
      .json({ error: "Invalid group id. Group not found." });
  }

  //Существует ли студент
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("*")
    .eq("student_name", student_name)
    .eq("student_surname", student_surname);

  if (student.length !== 0) {
    return res.status(400).json({ error: "Student already exists" });
  } else if (studentError) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to create student" });
  }

  const { data, error } = await supabase
    .from("students")
    .insert(studentData)
    .select();

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to create student" });
  }

  return res.status(200).json(data);
};

// Обновить данные студента
const update = async (req, res) => {
  const { id } = req.params;
  const studentData = req.body;

  //Существует ли
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

const studentsApi = { getAll, getById, create, update, remove };

export default studentsApi;
