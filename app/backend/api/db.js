import supabase from "../supabase/index.js";

// метод для получения данных из всех таблиц
async function fetchAllData() {
  try {
    // пользователи
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*");

    // студенты
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("*");

    // группы
    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select("*");

    // преподаватели
    const { data: teachers, error: teachersError } = await supabase
      .from("teachers")
      .select("*");

    // расписание на день
    const { data: dailyschedule, error: dailyscheduleError } = await supabase
      .from("dailyschedule")
      .select("*");

    // расписание на неделю
    const { data: weeklyschedule, error: weeklyscheduleError } = await supabase
      .from("weeklyschedule")
      .select("*");

    // предметы
    const { data: subjects, error: subjectsError } = await supabase
      .from("subjects")
      .select("*");

    usersError
      ? console.error("Ошибка получения пользователей:", usersError)
      : null;
    studentsError
      ? console.error("Ошибка получения студентов:", usersError)
      : null;
    groupsError ? console.error("Ошибка получения групп:", usersError) : null;
    teachersError
      ? console.error("Ошибка получения учителей:", usersError)
      : null;
    dailyscheduleError
      ? console.error("Ошибка получения расписания на день:", usersError)
      : null;
    weeklyscheduleError
      ? console.error("Ошибка получения расписания на неделю:", usersError)
      : null;
    subjectsError
      ? console.error("Ошибка получения предметов:", usersError)
      : null;

    return {
      users,
      students,
      groups,
      teachers,
      dailyschedule,
      weeklyschedule,
      subjects,
    };
  } catch (error) {
    console.error(error);
  }
}

const dbApi = { fetchAllData };
export default dbApi;
