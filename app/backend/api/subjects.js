import supabase from "../supabase/index.js";

// Получить все предметы
const getAll = async (req, res) => {
  const { data: subjects, error } = await supabase.from("subject").select("*");

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to fetch subjects" });
  }

  if (!subjects || subjects.length === 0) {
    return res.status(404).json({ error: "Subjects not found" });
  } else if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to fetch subjects" });
  } else return res.status(200).json(subjects);
};

// Получить предмет по ID
const getById = async (req, res) => {
  const { id } = req.params;
  const { data: subject, error } = await supabase
    .from("subject")
    .select("*")
    .eq("subject_id", id)
    .single();

  if (!subject || subject.length === 0) {
    return res.status(404).json({ error: "Subject not found" });
  } else if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to fetch subject" });
  } else return res.status(200).json(subject);
};

// Добавить новый предмет
const create = async (req, res) => {
  const { type, name, room } = req.body;

  //Существует ли предмет с кабинетом
  const { data: subject } = await supabase
    .from("subject")
    .select("*")
    .eq("type", type)
    .eq("name", name);

  if (subject.length !== 0) {
    return res.status(400).json({ error: "Subject already exists" });
  }

  const { data, error } = await supabase
    .from("subject")
    .insert({ type, name, room })
    .select();

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to create subject" });
  }

  return res.status(200).json(data);
};

// Обновить данные предмета
const update = async (req, res) => {
  const { id } = req.params;
  const { type, name } = req.body;

  //Существует ли данный предмет
  const { data: subject, error: subjectError } = await supabase
    .from("subject")
    .select("*")
    .eq("subject_id", id)
    .single();

  if (!subject || subject.length === 0) {
    return res.status(400).json({ error: "Subject not found" });
  } else if (subjectError) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to update subject" });
  }

  //Данные для обновления
  const updateData = {};
  if (type !== undefined || type !== subject.type) updateData.type = type;
  if (name !== undefined || name !== subject.name) updateData.name = name;

  // Если нет данных для обновления
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No data provided for update" });
  }

  const { data, error } = await supabase
    .from("subject")
    .update(updateData)
    .eq("subject_id", id)
    .select()
    .single();

  if (error) {
    console.error(error.message);
    return res.status(404).json({ error: "Subject not found!" });
  }

  return res.status(200).json(data);
};

// Удалить предмет
const remove = async (req, res) => {
  const { id } = req.params;

  // Существует ли группа с указанным ID
  const { data: subject, error: subjectError } = await supabase
    .from("subject")
    .select("*")
    .eq("subject_id", id);

  if (!subject || subject.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid subject_id. Subject not found." });
  } else if (subjectError) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to delete subject" });
  }

  const { error } = await supabase
    .from("subject")
    .delete()
    .eq("subject_id", id);

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to delete subject" });
  }

  return res.status(204).end();
};

const subjectsApi = { getAll, getById, create, update, remove };

export default subjectsApi;
