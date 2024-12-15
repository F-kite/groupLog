import { getParsedSchedule } from "../services/scheduleService.js";

async function scheduleRoutes(req, res) {
  const { week, group } = req.params;

  if (isNaN(week) || week < 1 || week > 26) {
    return res.status(400).json({ error: "Invalid week number" });
  }

  try {
    const schedule = await getParsedSchedule(week, group);
    res.json({ schedule });
    console.debug("Schedule successfull completed");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export default scheduleRoutes;
