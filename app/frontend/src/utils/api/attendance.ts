import axios from "axios";

const serverAttendanceURL = "http://localhost:3001/api/attendances";

// async function getWeekSchedule(group: string, week: number) {
//   try {
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => {
//       controller.abort();
//     }, 8000);

//     const response = await fetch(`${serverScheduleURL}/${group}/${week}`, {
//       method: "GET",
//       signal: controller.signal,
//     });

//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       console.error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
//       throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
//     }

//     const contentType = response.headers.get("content-type");
//     if (!contentType || !contentType.includes("application/json")) {
//       throw new Error("Ответ сервера не является JSON");
//     }

//     const data = await response.json();

//     return data;
//   } catch (error: any) {
//     if (error.name === "AbortError") {
//       throw new Error("Запрос был отменен из-за таймаута");
//     }
//     throw new Error(error.message);
//   }
// }

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
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: error };
  }
}

const attendanceApi = {
  getAttendanceByGroup,
};

export default attendanceApi;
