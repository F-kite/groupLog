import axios from "axios";

import { StudentMarkInfoProps } from "@/types/student";

const serverAttendanceURL = "http://localhost:3001/api/attendances";

async function getAttendanceByGroup(group: string, date?: string) {
  let strQuery = "";
  switch (date) {
    case "no":
    case "":
    case undefined:
      strQuery = `${serverAttendanceURL}/groups/${group}?date=no`;
      break;
    default:
      strQuery = `${serverAttendanceURL}/groups/${group}?date=${date
        .split("-")
        .join("")}`;
      break;
  }
  try {
    const response = await axios.get(strQuery);
    return response.data;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: error };
  }
}
async function addAttendanceRecords(data: StudentMarkInfoProps[]) {
  const sentData = JSON.stringify(data);
  try {
    const response = await axios.post(serverAttendanceURL, sentData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data) {
      return { success: response.data.message };
    }
    return { error: "Неизвестная ошибка: пустой ответ от сервера" };
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.error || "Ошибка запроса" };
    } else if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Неизвестная ошибка" };
  }
}

const attendanceApi = {
  getAttendanceByGroup,
  addAttendanceRecords,
};

export default attendanceApi;
