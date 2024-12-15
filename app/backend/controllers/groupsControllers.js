import supabase from "../supabase/index.js";

// Получить все группы
const getAll = async (req, res) => {
  const { data: groups, error } = await supabase.from("groups").select(`
    group_id,
    group_name,
    curator_id,
    teachers (
        teacher_id, 
        teacher_name, 
        teacher_email
    )
  `);

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to fetch groups" });
  }

  return res.json(groups);
};

// Получить группу по ID
const getById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("group")
    .select(
      `
        group_id,
        group_name,
        curator_id,
        teachers (teacher_name, teacher_email)
      `
    )
    .eq("group_id", id)
    .single();

  if (error) {
    console.error(error.message);
    return res.status(404).json({ error: "Group not found" });
  }

  return data;
};

// Добавить новую группу
const create = async (req, res) => {
  const { group_name, curator_id } = req.body;

  // Существует ли преподаватель с указанным ID
  const { data: curator, error: curatorError } = await supabase
    .from("teachers")
    .select("*")
    .eq("teacher_id", curator_id)
    .single();

  if (curatorError) {
    return res
      .status(400)
      .json({ error: "Invalid curator_id. Teacher not found." });
  }

  const { data, error } = await supabase
    .from("groups")
    .insert({ group_name, curator_id })
    .select()
    .single();

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to create group" });
  }

  return res.status(201).json(data);
};

// Обновить данные группы
const update = async (req, res) => {
  const { id } = req.params;
  const { group_name, curator_id } = req.body;

  const { data: curator, error: curatorError } = await supabase
    .from("teachers")
    .select("*")
    .eq("teacher_id", curator_id)
    .single();

  if (curatorError) {
    return res
      .status(400)
      .json({ error: "Invalid curator_id. Teacher not found." });
  }

  const { data, error } = await supabase
    .from("groups")
    .update({ group_name, curator_id })
    .eq("group_id", id)
    .select()
    .single();

  if (error) {
    console.error(error.message);
    return res.status(404).json({ error: "Group not found" });
  }

  return data;
};

// Удалить группу
const remove = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("groups")
    .delete()
    .eq("group_id", id);

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to delete group" });
  }

  return { message: "Group deleted successfully" };
};

const groupApi = { getAll, getById, create, update, remove };

export default groupApi;
