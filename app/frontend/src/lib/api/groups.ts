import axios from "axios";

const serverGroupURL = "http://localhost:3001/api/groups";

async function getAllGroups() {
  try {
    const response = await axios.get(`${serverGroupURL}`);
    return response.data;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: error };
  }
}

const groupApi = {
    getAllGroups,
};

export default groupApi;