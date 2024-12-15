import supabase from "../supabase/index.js";

// метод для получения данных из всех таблиц
async function fetchAllData() {
  try {
    // пользователи
    const { data: users } = await supabase.from("users").select("*");

    // студенты
    const { data: students } = await supabase.from("students").select("*");

    // группы
    const { data: groups } = await supabase.from("groups").select("*");

    // преподаватели
    const { data: teachers } = await supabase.from("teachers").select("*");

    // расписание на день
    const { data: dailyschedule } = await supabase
      .from("dailyschedule")
      .select("*");

    // расписание на неделю
    const { data: weeklyschedule } = await supabase
      .from("weeklyschedule")
      .select("*");

    // предметы
    const { data: subjects } = await supabase.from("subjects").select("*");

    return {
      users,
      students,
      groups,
      teachers,
      dailyschedule,
      weeklyschedule,
      subjects,
    };
  } catch (e) {
    console.error(e);
  }
}

const dbApi = { fetchAllData };
export default dbApi;
