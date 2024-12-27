import supabase from "../supabase/index.js";

// метод для получения данных пользователя из базы при наличии аутентифицированного пользователя
// объект, возвращаемый методом `auth.user`, извлекается из локального хранилища
const getByName = async (req, res) => {
  // const user = supabase.auth.user();
  const { name } = req.params;
  const user = true;
  if (user) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_name", name)
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
    //Существует ли уже пользователь с такой почтой
    const { data: userEmail } = await supabase
      .from("users")
      .select("*")
      .eq("user_email", email)
      .single();

    if (userEmail) {
      return res
        .status(400)
        .json({ error: "Invalid email. User with this email already exists." });
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
        .json({ error: "Invalid name. User with that name already exists." });
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to register user" });
    }

    const user_age = additionalData.age || null;
    const user_avatar_url = additionalData.avatar || null;

    const profileData = {
      user_name: name,
      user_email: email,
      user_age,
      user_avatar_url,
    };

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .insert([{ ...profileData }]);

    if (profileError) {
      throw new Error(profileError.message);
    }

    console.debug(`User ${name} : ${email} was registered`);
    return res.status(200).json({ message: "User is registered" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to register user" });
  }
};

// Авторизация пользователя
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    return res.status(200).json("User is logined");
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
  getByName,
  registration,
  login,
  logout,
  update,
  uploadAvatar,
  remove,
};

export default userApi;
