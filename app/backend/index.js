import express from "express";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import groupApi from "./controllers/groupsControllers.js";
import teacherApi from "./controllers/teachersControllers.js";

const PORT = process.env.PORT || 3001;

const app = express();

app.listen(PORT, (error) => {
  error ? console.log(error) : console.log(`listening port ${PORT}`);
});

app.get("/api", (req, res) => {
  res.json({
    message: "Hello from backend!",
  });
});

app.get("/api/parser/:group/:week", scheduleRoutes);

app.get("/api/groups", groupApi.getAll); // Получить все группы
app.get("/api/groups/:id", groupApi.getById); // Получить группу по ID
app.post("/api/groups", groupApi.create); // Добавить новую группу
app.put("/api/groups/:id", groupApi.update); // Обновить данные группы
app.delete("/api/groups/:id", groupApi.remove); // Удалить группу

app.get("/api/teachers", teacherApi.getAll); // Получить всех преподавателей
app.get("/api/teachers/:id", teacherApi.getById); // Получить преподавателя по ID
app.post("/api/teachers", teacherApi.create); // Добавить нового преподавателя
app.put("/api/teachers/:id", teacherApi.update); // Обновить данные преподавателя
app.delete("/api/teachers/:id", teacherApi.remove); // Удалить преподавателя
