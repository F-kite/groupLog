import supabase from "../supabase/index.js";

// метод для получения данных из всех таблиц
async function GetAllData() {
  try {
    // пользователи
    const { data: users, error: usersError } = await supabase
      .from("user")
      .select("*");

    // студенты
    const { data: students, error: studentsError } = await supabase
      .from("student")
      .select("*");

    // группы
    const { data: groups, error: groupsError } = await supabase
      .from("group")
      .select("*");

    // преподаватели
    const { data: teachers, error: teachersError } = await supabase
      .from("teacher")
      .select("*");

    // расписание на день
    const { data: dailyschedule, error: dailyscheduleError } = await supabase
      .from("day_schedule")
      .select("*");

    // расписание на неделю
    const { data: weeklyschedule, error: weeklyscheduleError } = await supabase
      .from("week_schedule")
      .select("*");

    // предметы
    const { data: subjects, error: subjectsError } = await supabase
      .from("subject")
      .select("*");

    // расписание одной пары
    const { data: lessons, error: lessonsError } = await supabase
      .from("lessson_schedule")
      .select("*");

    usersError
      ? console.error("Ошибка получения пользователей:", usersError)
      : null;
    studentsError
      ? console.error("Ошибка получения студентов:", studentsError)
      : null;
    groupsError ? console.error("Ошибка получения групп:", groupsError) : null;
    teachersError
      ? console.error("Ошибка получения учителей:", teachersError)
      : null;
    dailyscheduleError
      ? console.error(
          "Ошибка получения расписания на день:",
          dailyscheduleError
        )
      : null;
    weeklyscheduleError
      ? console.error(
          "Ошибка получения расписания на неделю:",
          weeklyscheduleError
        )
      : null;
    subjectsError
      ? console.error("Ошибка получения предметов:", subjectsError)
      : null;
    lessonsError
      ? console.error("Ошибка получения расписания одной пары:", lessonsError)
      : null;

    return {
      users,
      students,
      groups,
      teachers,
      dailyschedule,
      weeklyschedule,
      subjects,
      lessons,
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

const dbApi = { GetAllData, refreshAuthToken };
export default dbApi;
