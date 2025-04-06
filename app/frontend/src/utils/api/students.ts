import axios from "axios";

const serverStudentsURL = "http://localhost:3001/api/students";

async function getStudentsByGroup(group: string) {
  try {
    const response = await axios.get(`${serverStudentsURL}/groups/${group}`);
    return response.data;
  } catch (error: any) {
    console.error(error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: error };
  }
}
const studentApi = {
  getStudentsByGroup,
};

export default studentApi;
