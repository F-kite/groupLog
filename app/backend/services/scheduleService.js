import parseSchedule from "./parseSchedule.js";
import formatSchedule from "../utils/formatSchedule.js";

export async function getParsedSchedule(week, group) {
  try {
    const schedule = await parseSchedule(week, group);
    return formatSchedule(schedule, week, group);
  } catch (error) {
    throw new Error(`Failed to get parsed schedule: ${error.message}`);
  }
}
