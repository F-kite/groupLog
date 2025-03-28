import supabase from "../supabase/index.js";

// Получить всех преподавателей
const getAll = async (req, res) => {
  const { data: teachers, error } = await supabase.from("teacher").select("*");

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to fetch teachers" });
  }

  return res.status(200).json(teachers);
};

// Получить преподавателя по ID
const getById = async (req, res) => {
  const { id } = req.params;
  const { data: teacher, error } = await supabase
    .from("teacher")
    .select("*")
    .eq("teacher_id", id)
    .single();

  if (error) {
    console.error(error.message);
    return res.status(404).json({ error: "Teacher not found" });
  }

  return res.status(200).json(teacher);
};

// Добавить нового преподавателя
const create = async (req, res) => {
  const { name, phone, email } = req.body;

  const { data: checking_the_teacher } = await supabase
    .from("teacher")
    .select("*")
    .eq("name", name);

  if (checking_the_teacher.length !== 0) {
    return res.status(400).json({ error: "Teacher already exists" });
  }

  const { data, error } = await supabase
    .from("teacher")
    .insert({ name, phone, email })
    .select();

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to create teacher" });
  }

  return res.status(200).json(data);
};

// Обновить данные преподавателя
const update = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email } = req.body;
  const { data, error } = await supabase
    .from("teacher")
    .update({ name, phone, email })
    .eq("teacher_id", id)
    .select()
    .single();

  if (error) {
    console.error(error.message);
    return res.status(404).json({ error: "Teacher not found" });
  }

  return res.status(200).json(data);
};

// Удалить преподавателя
const remove = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("teacher")
    .delete()
    .eq("teacher_id", id);

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to delete teacher" });
  }

  return res.status(204).end();
};

const teacherApi = { getAll, getById, create, update, remove };
export default teacherApi;
