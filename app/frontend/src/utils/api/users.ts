import axios from "axios";

type RegistrationUserProps = {
  name: string;
  email: string;
  password: string;
};
type LoginUserProps = {
  name?: string;
  email?: string;
  password: string;
};

type Response = { success: string } | { error: string };

const serverUsersURL = "http://localhost:3001/api/users";

const RegistrationUser = async (
  data: RegistrationUserProps
): Promise<Response> => {
  const sentData = JSON.stringify(data);
  console.debug("sentData:", sentData);
  try {
    const response = await axios.post(
      `${serverUsersURL}/registration`,
      sentData,
      {
        headers: {
          "Content-Type": "application/json", // формат передаваемых данных
        },
      }
    );
    if (response.data) {
      return { success: response.data.message };
    }
    return { error: "Неизвестная ошибка: пустой ответ от сервера" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.error || "Ошибка запроса" };
    } else if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Неизвестная ошибка" };
  }
};

const LoginUser = async (data: LoginUserProps): Promise<Response> => {
  const sentData = JSON.stringify(data);
  console.debug("sentData:", sentData);
  try {
    const response = await axios.post(`${serverUsersURL}/login`, sentData, {
      headers: {
        "Content-Type": "application/json", // формат передаваемых данных
      },
    });
    if (response.data) {
      return { success: response.data.message };
    }
    return { error: "Неизвестная ошибка: пустой ответ от сервера" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.error || "Ошибка запроса" };
    } else if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Неизвестная ошибка" };
  }
};

const userApi = {
  RegistrationUser,
  LoginUser,
};

export default userApi;
