import axios from "axios";

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

const scheduleApi = {
  getWeekSchedule,
};

export default scheduleApi;
