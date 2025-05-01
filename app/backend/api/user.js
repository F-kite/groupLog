import bcrypt from "bcrypt";
import supabase from "../supabase/index.js";
import { emailSchema, usernameSchema } from "../schemas/userSchema.js";

// метод для получения данных пользователя из базы при наличии аутентифицированного пользователя
// объект, возвращаемый методом `auth.user`, извлекается из локального хранилища
const getUserInfo = async (req, res) => {
  const authToken = req.cookies.authToken;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(authToken);

  if (user) {
    const email = user.email;
    try {
      const { data: userInfo, error: userInfoError } = await supabase
        .from("users")
        .select(
          `
          name,
          user_role(name),
          assigned_group,
          group(name)
          `
        )
        .eq("email", email)
        .single();

      if (userInfoError) {
        console.error(userInfoError.message);
        throw new Error(userInfoError.message);
      }
      let data = {};

      if (userInfo && userInfo.assigned_group === null) {
        data = {
          name: userInfo.name,
          group: null,
          role: userInfo.user_role.name,
        };
      } else {
        data = {
          name: userInfo.name,
          group: userInfo.group?.name,
          role: userInfo.user_role.name,
        };
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: error.message || "Failed to get user" });
    }
  }
  return null;
};

const getAllUsers = async (req, res) => {
  const authToken = req.cookies.authToken;
  const {
    data: { user },
  } = await supabase.auth.getUser(authToken);
  if (user) {
    try {
      const { data: userInfo, error } = await supabase
        .from("users")
        .select(
          `user_id, user_role(name), name, email, group(name), created_at`
        );

      if (error) {
        console.error(error.message);
        return res.status(500).json({ error: "Failed to get user" });
      }

      return res.status(200).json(userInfo);
    } catch (error) {
      console.error(error);
    }
  }
  return null;
};

// Регистрация пользователя
const registration = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    //Существует ли пользователь с такой почтой
    const { data: userEmail } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userEmail) {
      return res
        .status(400)
        .json({ error: "Пользователь с такой почтой уже существует" });
    }
    //Существует ли пользователь с таким именем
    const { data: userName } = await supabase
      .from("users")
      .select("*")
      .eq("name", name)
      .single();

    if (userName) {
      return res
        .status(400)
        .json({ error: "Пользователь с таким именем уже существует" });
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(500).json({ error: "Ошибка при регистрации" });
    }

    const profileData = {
      name: name,
      email: email,
    };

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .insert([{ ...profileData }]);

    if (profileError) {
      throw new Error(profileError.message);
    }

    console.debug(`User ${name} : ${email} was registered`);
    return res.status(200).json({
      message:
        "Подтвердите вашу почту в письме, отправленного на указанный почтовый адрес",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Ошибка при регистрации" });
  }
};

// Авторизация пользователя
const login = async (req, res) => {
  const { userLogin, password } = req.body;

  try {
    let email;
    const isEmail = emailSchema.validate(userLogin).error === undefined;
    const isUsername = usernameSchema.validate(userLogin).error === undefined;
    if (isEmail) {
      email = userLogin;
    } else if (isUsername) {
      const { data: userEmail, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("name", userLogin)
        .limit(1)
        .single();

      if (userError) {
        console.error(userError);
        console.log("userEmail:", userEmail);
        return res.status(400).json({ error: "Ошибка получения почты" });
      }

      if (!userEmail) {
        return res
          .status(400)
          .json({ error: "Пользователя с таким логином не существует" });
      }
      email = userEmail.email;
    }

    let { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error(error.message);
      return res.status(400).json({ error: "Неверный логин или пароль" });
    }

    console.debug(`User ${email} logged in`);

    // сохранение токена авторизации в куки
    res.cookie("authToken", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 час
    });

    // сохранение токена обновления авторизации в куки
    res.cookie("refreshToken", data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });

    return res.status(200).json({ message: "Успешно" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to login user" });
  }
};

// Выход из системы
const logout = async (req, res) => {
  try {
    const authToken = req.cookies.authToken;
    const {
      data: { user },
    } = await supabase.auth.getUser(authToken);

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Уничтожение сессии
    if (req.session) {
      console.log(req.session);
      req.session.destroy((err) => {
        if (err) {
          console.error("Ошибка при уничтожении сессии:", err);
          return res.status(500).json({ error: "Ошибка при выходе" });
        }
      });
    }

    res.clearCookie("authToken"); // Удаление access-токена
    res.clearCookie("refreshToken"); // Удаление refresh-токена
    console.info(`User ${user.email} log out`);
    return res.status(200).json("Успешно");
  } catch (err) {
    return res.status(500).json("Ошибка при выходе");
  }
};

// Обновление данных пользователя
const update = async (req, res) => {
  const authToken = req.cookies.authToken;
  const {
    data: { user },
  } = await supabase.auth.getUser(authToken);
  console.log(user);
  if (!user) return;
  const { data } = req.body;
  try {
    const { data: _user, error } = await supabase
      .from("user")
      .update(data)
      .match({ id: user.id })
      .single();
    if (error) throw error;
    return _user;
  } catch (err) {
    throw err;
  }
};

// Обновление данных пользователя
const updateRoleAndGroup = async (req, res) => {
  try {
    const data = req.body;
    const verifyData = {};

    if (data.group != "") {
      const { data: group } = await supabase
        .from("group")
        .select("group_id, name")
        .eq("name", data.group)
        .single();
      verifyData.group = group.group_id;
    } else verifyData.group = null;

    if (data.role != "") {
      const { data: role } = await supabase
        .from("user_role")
        .select("role_id, name")
        .eq("name", data.role)
        .single();
      verifyData.role = role.role_id;
    } else verifyData.role = null;

    let updatedData = {};
    updatedData.assigned_group =
      verifyData.group == null ? null : verifyData.group;

    if (verifyData.role !== null) updatedData.role_id = verifyData.role;

    if (Object.keys(updatedData).length !== 0) {
      const { data: _user, error } = await supabase
        .from("users")
        .update(updatedData)
        .eq("user_id", data.user_id)
        .single();

      if (error) throw error;
      return res.status(200).json({ message: "Обновление применено" });
    } else return res.status(404).json({ message: "Данные уже актуальны" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Ошибка при обновлении" });
  }
};

//Удаление пользователя (из бд)
const remove = async (req, res) => {
  const user = req.params;

  //Существует ли пользователь с таким id
  const { data: userCheck, error: userCheckError } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!userCheck || userCheckError) {
    return res.status(400).json({ error: "User not found." });
  }

  const userEmail = userCheck.email;

  const {
    data: { users },
  } = await supabase.auth.admin.listUsers();

  const authUser = users.filter((user) => {
    if (user.email === userEmail) return user;
  });
  let authUserId;
  if (authUser.length > 0) {
    authUserId = authUser[0].id;
  } else throw new Error("User not found");

  const { data: deleteFromDb, error: deleteFromDbError } =
    await supabase.auth.admin.deleteUser(authUserId);
  if (deleteFromDbError) {
    console.error(deleteFromDbError.message);
    return res.status(500).json({ error: "Failed to delete user" });
  }

  const { error: deleteFromTableUsersError } = await supabase
    .from("users")
    .delete()
    .eq("user_id", user.id);

  if (deleteFromTableUsersError) {
    console.error(deleteFromTableUsersError.message);
    return res.status(500).json({ error: "Failed to delete user" });
  }

  console.debug(`User ${userCheck.name} : ${userCheck.email} was deleted`);
  return res.status(200).json({ success: true });
};

// Сохранение аватара пользователя

// адрес хранилища
const STORAGE_URL = `${process.env.SUPABASE_URL}/storage/v1/object/public/`;

//Аватар пользователя
const uploadAvatar = async (file) => {
  const user = supabase.auth.user();
  if (!user) return;
  const { id } = user;
  // извлекаем расширение из названия файла
  // метод `at` появился в `ECMAScript` в этом году, он позволяет простым способом извлекать элементы массива с конца
  const ext = file.name.split(".").at(-1);
  // формируем название аватара
  const name = id + "." + ext;
  try {
    // загружаем файл в хранилище
    const {
      // возвращаемый объект имеет довольно странную форму
      data: { Key },
      error,
    } = await supabase.storage.from("avatars").upload(name, file, {
      // не кешировать файл - это важно!
      cacheControl: "no-cache",
      // перезаписывать аватар при наличии
      upsert: true,
    });
    if (error) throw error;
    // формируем путь к файлу
    const user_avatar_url = STORAGE_URL + Key;
    // обновляем данные пользователя -
    // записываем путь к аватару
    const { data: _user, error: _error } = await supabase
      .from("user")
      .update({ user_avatar_url })
      .match({ id })
      .single();
    if (_error) throw _error;
    // возвращаем обновленного пользователя
    return _user;
  } catch (e) {
    throw e;
  }
};

const userApi = {
  getUserInfo,
  getAllUsers,
  registration,
  login,
  logout,
  update,
  updateRoleAndGroup,
  uploadAvatar,
  remove,
};

export default userApi;
