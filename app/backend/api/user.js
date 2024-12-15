import supabase from "../supabase";
import serializeUser from "../utils/serializeUser";

// метод для получения данных пользователя из базы при наличии аутентифицированного пользователя
// объект, возвращаемый методом `auth.user`, извлекается из локального хранилища
const get = async () => {
  const user = supabase.auth.user();
  if (user) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select()
        .match({ id: user.id })
        .single();
      if (error) throw error;
      console.log(data);
      return data;
    } catch (e) {
      throw e;
    }
  }
  return null;
};

// метод для регистрации пользователя
const register = async (data) => {
  const { email, password, user_name } = data;
  try {
    // регистрируем пользователя
    const { user, error } = await supabase.auth.signUp(
      // основные/обязательные данные
      {
        email,
        password,
      },
      // дополнительные/опциональные данные
      {
        data: {
          user_name,
        },
      }
    );
    if (error) throw error;
    // записываем пользователя в базу
    const { data: _user, error: _error } = await supabase
      .from("users")
      // сериализуем объект пользователя
      .insert([serializeUser(user)])
      .single();
    if (_error) throw _error;
    return _user;
  } catch (e) {
    throw e;
  }
};

// метод для авторизации пользователя
const login = async (data) => {
  try {
    // авторизуем пользователя
    const { user, error } = await supabase.auth.signIn(data);
    if (error) throw error;
    // получаем данные пользователя из базы
    const { data: _user, error: _error } = await supabase
      .from("users")
      .select()
      .match({ id: user.id })
      .single();
    if (_error) throw _error;
    return _user;
  } catch (e) {
    throw e;
  }
};

// метод для выхода из системы
const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return null;
  } catch (e) {
    throw e;
  }
};

// метод для обновления данных пользователя
const update = async (data) => {
  // получаем объект с данными пользователя
  const user = supabase.auth.user();
  if (!user) return;
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

// метод для сохранения аватара пользователя

// адрес хранилища
const STORAGE_URL = `${
  import.meta.env.VITE_SUPABASE_URL
}/storage/v1/object/public/`;

//принимает аватар пользователя
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

const userApi = { get, register, login, logout, update, uploadAvatar };

export default userApi;
