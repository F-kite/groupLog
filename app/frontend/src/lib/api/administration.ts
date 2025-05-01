import axios from "axios";
import { SentDataOnChangedUserInfoProps } from "../types/user";

type Response = { success: string } | { error: string };

const serverUsersAdminURL = "http://localhost:3001/api/admin/users";

const fetchAllUsers = async () => {
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
const fetchUsersByEmail = async () => {
  const email = "";
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
const changedGroupOrRoleUser = async (
  data: SentDataOnChangedUserInfoProps
): Promise<Response> => {
  try {
    const response = await axios.put(`${serverUsersAdminURL}`, data);
    if (response.statusText == "OK" && response.data) {
      return response.data;
    }
    throw new Error("Пустой  ответ от сервера");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.error || "Ошибка запроса" };
    } else if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Неизвестная ошибка" };
  }
};

const removeUser = async (userId: number) => {
  try {
    const response = await axios.delete(`${serverUsersAdminURL}/${userId}`);
    console.log(response);
    if (response.statusText == "OK" && response.data) {
      return response.data;
    }
    throw new Error("Пустой  ответ от сервера");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.error || "Ошибка запроса" };
    } else if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Неизвестная ошибка" };
  }
};

const administrationApi = {
  fetchAllUsers,
  fetchUsersByEmail,
  changedGroupOrRoleUser,
  removeUser,
};

export default administrationApi;
