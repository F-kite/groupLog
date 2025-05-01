import axios from "axios";

axios.defaults.withCredentials = true;

const API_URL = "http://localhost:3001";

export async function checkServer() {
  try {
    const response = await axios.get(`${API_URL}/ping`);
    return { message: response.data };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: error };
  }
}

export async function getProtectedRouteData() {
  try {
    const response = await axios.get(`${API_URL}/dashboard`);
    return { message: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          `${error.message}: ${error.response?.statusText}` ||
          "Ошибка авторизации",
      };
    }
    return { error: error };
  }
}
