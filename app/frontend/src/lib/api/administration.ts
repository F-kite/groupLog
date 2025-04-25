import axios from "axios";

const serverUsersAdminURL = "http://localhost:3001/api/admin/users";

const FetchAllUsers = async () => {
  try {
    const response = await axios.get(serverUsersAdminURL);
    if (response.statusText == "OK") {
      return response.data;
    } else {
      throw new Error("Ошибка при выходе из системы");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.error || "Ошибка запроса" };
    } else if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Неизвестная ошибка" };
  }
};
const FetchUsersByEmail = async () => {
  const email = "ilichevv_v845@mail.ru"
  try {
    const response = await axios.get(`${serverUsersAdminURL}/${email}`);
    console.log(response);
    if (response.statusText == "OK") {
      return response.data;
    } else {
      throw new Error("Ошибка при выходе из системы");
    }
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.error || "Ошибка запроса" };
    } else if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Неизвестная ошибка" };
  }
};

const administrationApi = {
  FetchAllUsers,
  FetchUsersByEmail
};

export default administrationApi;
