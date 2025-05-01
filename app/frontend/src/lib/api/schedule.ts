import axios from "axios";

type Response = { success: string } | { error: string };

const serverScheduleURL = "http://localhost:3001/api/schedule";

async function getWeekSchedule(group: string, week: number) {
  try {
    const response = await axios.get(`${serverScheduleURL}/${group}/${week}`);
    return response.data;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: error };
  }
}

async function createSchedule(group: string, week: number): Promise<Response> {
  try {
    const response = await axios.post(`${serverScheduleURL}/${group}/${week}`);
    if (response.status == 204) {
      return { success: "Раписание успешно создано и занесено в базу данных" };
    }
    return { error: "Ошибка" };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Неизвестая ошибка" };
  }
}

const scheduleApi = {
  getWeekSchedule,
  createSchedule,
};

export default scheduleApi;
