import supabase from "../supabase/index.js";
import { emailSchema, usernameSchema } from "../schemas/userSchema.js";

// метод для получения данных пользователя из базы при наличии аутентифицированного пользователя
// объект, возвращаемый методом `auth.user`, извлекается из локального хранилища
const getByEmail = async (req, res) => {
  const user = supabase.auth.user();
  console.debug(user);
  const { email } = req.params;
  if (user) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_email", email)
        .single();

      if (error) {
        console.error(error.message);
        return res.status(500).json({ error: "Failed to get user" });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
    }
  }
  return null;
};

// Регистрация пользователя
const registration = async (req, res) => {
  const { name, email, password, additionalData = {} } = req.body;
  try {
    //Существует ли пользователь с такой почтой
    const { data: userEmail } = await supabase
      .from("users")
      .select("*")
      .eq("user_email", email)
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
      .eq("user_name", name)
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

    const user_avatar_url = additionalData.avatar || null;

    const profileData = {
      user_name: name,
      user_email: email,
      user_avatar_url,
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
    console.debug(isEmail, isUsername)
    if (isEmail) {
      email = userLogin;
    } else if (isUsername) {
      const { data: userEmail, error: userError } = await supabase
        .from("users")
        .select("user_email")
        .eq("user_name", userLogin)
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
      email = userEmail.user_email;
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return res.status(204).end();
  } catch (e) {
    throw e;
  }
};

// Обновление данных пользователя
const update = async (req, res) => {
  const user = supabase.auth.user();
  if (!user) return;
  const { data } = req.body;
  try {
    const { data: _user, error } = await supabase
      .from("users")
      .update(data)
      .match({ id: user.id })
      .single();
    if (error) throw error;
    return _user;
  } catch (e) {
    throw e;
  }
};

//Удаление пользователя (из бд)
const remove = async (req, res) => {
  const { email } = req.body;

  //Существует ли пользователь с таким email
  const { data: userCheck } = await supabase
    .from("users")
    .select("*")
    .eq("user_email", email)
    .single();

  if (!userCheck) {
    return res
      .status(400)
      .json({ error: "Invalid email. User with this email not found." });
  }

  const { error } = await supabase
    .from("users")
    .delete()
    .eq("user_email", email);

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to delete user" });
  }

  await logout();
  console.debug(
    `User ${userCheck.user_name} : ${userCheck.user_email} was deleted`
  );
  return res.status(204).end();
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
      .from("users")
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
  getByEmail,
  registration,
  login,
  logout,
  update,
  uploadAvatar,
  remove,
};

export default userApi;
