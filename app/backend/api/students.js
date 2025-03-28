import supabase from "../supabase/index.js";

// Получить всех студентов
const getAll = async (req, res) => {
  const { data: students, error } = await supabase.from("student").select(`
    student_id,
    group (name),
    subgroup,
    name,
    surname,
    patronymic,
    phone,
    email,
    tgid,
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
    .from("student")
    .select(
      `
    student_id,
    group (name),
    subgroup,
    name,
    surname,
    patronymic,
    phone,
    email,
    tgid,
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
  const groupName = req.params.group;

  // Существует ли группа
  const { data: group, error: groupError } = await supabase
    .from("group")
    .select("group_id")
    .eq("name", groupName)
    .single();

  if (groupError) {
    return res.status(400).json({ error: "Invalid group. Group not found." });
  }

  const { data: students, error } = await supabase
    .from("student")
    .select(
      `
    student_id,
    subgroup,
    name,
    surname,
    patronymic,
    phone,
    email,
    tgid,
    enrollment_year
      `
    )
    .eq("group_id", group.group_id)
    .order("surname", { ascending: true });

  if (!students || students.length === 0) {
    return res.status(404).json({ error: "Students not found" });
  } else if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to fetch students" });
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
    .from("group")
    .select("group_id")
    .eq("name", group_name)
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
  console.log(updatedStudentsData);
  const studentNames = updatedStudentsData.map((student) => ({
    name: student.name,
    surname: student.surname,
  }));

  // Проверяем, существуют ли уже такие студенты в базе данных
  const { data: existingStudents, error: studentError } = await supabase
    .from("student")
    .select("name, surname")
    .in(
      "name",
      studentNames.map((s) => s.name)
    )
    .in(
      "surname",
      studentNames.map((s) => s.surname)
    );

  if (studentError) {
    console.error(studentError);
    return res
      .status(500)
      .json({ error: "Error checking for existing students." });
  }

  // Находим дубликаты
  const duplicateStudents = existingStudents.filter((existingStudent) =>
    studentNames.some(
      (el) =>
        el.name === existingStudent.name &&
        el.surname === existingStudent.surname
    )
  );

  if (duplicateStudents.length > 0) {
    return res.status(400).json({
      error: "Some students already exist.",
      duplicates: duplicateStudents,
    });
  }

  const { data, error } = await supabase
    .from("student")
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
      .from("student")
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
      .from("group")
      .select("group_id")
      .eq("name", group)
      .single();

    if (chekGroupError || chekGroup.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid group name. Group not found." });
    }

    if (studentData.name) {
      const group_id = chekGroup.group_id;
      // Удаляем group_name и добавляем group_id
      const { name, ...rest } = studentData;
      return { ...rest, group_id };
    }

    console.log(studentData);
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
      .from("student")
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
    .from("student")
    .select("*")
    .eq("student_id", id);

  if (!student || student.length === 0) {
    return res.status(400).json({ error: "Invalid id. student not found." });
  } else if (studentError) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to delete student" });
  }

  const { error } = await supabase
    .from("student")
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
