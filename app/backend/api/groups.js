import supabase from "../supabase/index.js";

// Получить все группы
const getAll = async (req, res) => {
  const { data: groups, error } = await supabase.from("group").select(`
    group_id,
    name,
    curator_id,
    teacher (name, email)
  `);

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to fetch groups" });
  }

  if (!groups || groups.length === 0) {
    return res.status(404).json({ error: "Groups not found" });
  } else if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to fetch groups" });
  } else return res.status(200).json(groups);
};

// Получить группу по ID
const getById = async (req, res) => {
  const { id } = req.params;
  const { data: group, error } = await supabase
    .from("group")
    .select(
      `
        group_id,
        name,
        curator_id,
        teacher (name, email)
      `
    )
    .eq("group_id", id)
    .single();

  if (!group || group.length === 0) {
    return res.status(404).json({ error: "Group not found" });
  } else if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to fetch group" });
  } else return res.status(200).json(group);
};

// Добавить новую группу
const create = async (req, res) => {
  const { name, curator_id } = req.body;

  // Существует ли преподаватель с указанным ID
  const { data: curator, error: curatorError } = await supabase
    .from("teacher")
    .select("*")
    .eq("teacher_id", curator_id);

  if (curatorError) {
    return res
      .status(400)
      .json({ error: "Invalid curator_id. Teacher not found." });
  }

  //Существует ли группа с указанным именем
  const { data: group, error: groupError } = await supabase
    .from("group")
    .select("*")
    .eq("name", name);

  if (group.length !== 0) {
    return res.status(400).json({ error: "Group already exists" });
  } else if (groupError) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to create group" });
  }

  const { data, error } = await supabase
    .from("group")
    .insert({ name, curator_id })
    .select();

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to create group" });
  }

  return res.status(200).json(data);
};

// Обновить данные группы
const update = async (req, res) => {
  const { id } = req.params;
  const { name, curator_id } = req.body;

  //Существует ли данная группа
  const { data: group, error: groupError } = await supabase
    .from("group")
    .select("*")
    .eq("group_id", id)
    .single();

  if (!group || group.length === 0) {
    return res.status(400).json({ error: "Group not found" });
  } else if (groupError) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to update group" });
  }

  //Данные для обновления
  const updateData = {};
  if (name !== undefined || name !== group.name) updateData.name = name;
  if (curator_id !== undefined || curator_id !== group.curator_id)
    updateData.curator_id = curator_id;

  // Если нет данных для обновления
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No data provided for update" });
  }

  const { data, error } = await supabase
    .from("group")
    .update(updateData)
    .eq("group_id", id)
    .select()
    .single();

  if (error) {
    console.error(error.message);
    return res.status(404).json({ error: "Group not found!" });
  }

  return res.status(200).json(data);
};

// Удалить группу
const remove = async (req, res) => {
  const { id } = req.params;

  // Существует ли группа с указанным ID
  const { data: group, error: groupError } = await supabase
    .from("group")
    .select("*")
    .eq("group_id", id);

  if (!group || group.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid group_id. Group not found." });
  } else if (groupError) {
    console.error(error.message);
    return res.status(500).json({ error: "Error to delete group" });
  }

  const { error } = await supabase.from("group").delete().eq("group_id", id);

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to delete group" });
  }

  return res.status(204).end();
};

const groupsApi = { getAll, getById, create, update, remove };

export default groupsApi;
