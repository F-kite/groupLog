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

const refreshAuthToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error) {
    return res.status(401).json({ message: "Failed to refresh token" });
  }

  // Обновляем токен
  res.cookie("authToken", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 час
  });

  res.status(200).json({ message: "Token refreshed successfully" });
};

const dbApi = { fetchAllData, refreshAuthToken };
export default dbApi;
