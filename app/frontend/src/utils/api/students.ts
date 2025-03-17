const serverStudentsURL = "http://localhost:3001/api/students";

async function getStudentsByGroup(group: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 5000);

    const response = await fetch(`${serverStudentsURL}/groups/${group}`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
      throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Ответ сервера не является JSON");
    }

    const data = await response.json();

    return data;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Запрос был отменен из-за таймаута");
    }
    throw new Error(error.message);
  }
}
const studentApi = {
  getStudentsByGroup,
};

export default studentApi;
