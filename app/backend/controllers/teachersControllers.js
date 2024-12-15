import supabase from "../supabase/index.js";

// Получить всех преподавателей
const getAll = async (req, res) => {
  const { data: teachers, error } = await supabase.from("teachers").select("*");

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to fetch teachers" });
  }

  return res.json(teachers);
};

// Получить преподавателя по ID
const getById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("teacher_id", id)
    .single();

  if (error) {
    console.error(error.message);
    return res.status(404).json({ error: "Teacher not found" });
  }

  return data;
};

// Добавить нового преподавателя
const create = async (req, res) => {
  const { teacher_name, teacher_phone, teacher_email } = req.body;
  const { data, error } = await supabase
    .from("teachers")
    .insert([{ teacher_name, teacher_phone, teacher_email }])
    .select()
    .single();

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to create teacher" });
  }

  return res.status(201).json(data);
};

// Обновить данные преподавателя
const update = async (req, res) => {
  const { id } = req.params;
  const { teacher_name, teacher_phone, teacher_email } = req.body;
  const { data, error } = await supabase
    .from("teachers")
    .update({ teacher_name, teacher_phone, teacher_email })
    .eq("teacher_id", id)
    .select()
    .single();

  if (error) {
    console.error(error.message);
    return res.status(404).json({ error: "Teacher not found" });
  }

  return data;
};

// Удалить преподавателя
const remove = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("teachers")
    .delete()
    .eq("teacher_id", id);

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to delete teacher" });
  }

  return { message: "Teacher deleted successfully" };
};

const teacherApi = { getAll, getById, create, update, remove };
export default teacherApi;
