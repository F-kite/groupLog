import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { validate, authMiddleware } from "./middleware.js";

import dbApi from "./api/db.js";
import userApi from "./api/user.js";
import teacherApi from "./api/teachers.js";
import groupApi from "./api/groups.js";
import subjectsApi from "./api/subjects.js";
import studentsApi from "./api/students.js";
import scheduleApi from "./api/schedules.js";

import {
  groupSchemaToCreate,
  groupSchemaToUpdate,
} from "./schemas/groupSchema.js";
import {
  studentSchemaToCreate,
  studentSchemaToUpdate,
} from "./schemas/studentSchema.js";
import {
  userRegisterSchema,
  userDeleteSchema,
  userSchemaToUpdate,
  userLoginSchema,
} from "./schemas/userSchema.js";
import {
  teacherSchemaToCreate,
  teacherSchemaToUpdate,
} from "./schemas/teacherSchema.js";

import {
  subjectSchemaToCreate,
  subjectSchemaToUpdate,
} from "./schemas/subjectSchema.js";

const app = express();
const PORT = process.env.PORT || 3001;
let serverReady = false;

app.use(express.json());
app.use(cookieParser());

// CORS
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : (console.log(`listening port ${PORT}`), (serverReady = true));
});

app.get("/ping", (req, res) => {
  if (serverReady) {
    res.status(200).json({ message: "Server worked" });
  }
});

app.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Вы авторизованы",
    user: req.user,
  });
});

app.post("/api/refresh-token", dbApi.refreshAuthToken);

/*
post - создание со статусом 201 после успешного выполнения
put - обновление записи
*/

app.get("/api/parser/:group/:week", scheduleApi.getSchedule);
app.post("/api/parser/:group/:week", scheduleApi.createSchedule);

app.get("api/admin/user", userApi.getByEmail);
app.delete("api/admin/user", validate(userDeleteSchema), userApi.remove);

app.post(
  "/api/users/registration",
  validate(userRegisterSchema),
  userApi.registration
);
app.post("/api/users/login", validate(userLoginSchema), userApi.login);
app.post("/api/users/logout", userApi.logout);
app.put("/api/users/update", validate(userSchemaToUpdate), userApi.update); // нужно проверить с авторизацией
app.post("/api/users/:id/avatar", userApi.uploadAvatar); // нужно проверить с авторизацией

app.get("/api/groups", groupApi.getAll); // Получить все группы
app.get("/api/groups/:id", groupApi.getById);
app.post("/api/groups", validate(groupSchemaToCreate), groupApi.create);
app.put("/api/groups/:id", validate(groupSchemaToUpdate), groupApi.update);
app.delete("/api/groups/:id", groupApi.remove);

app.get("/api/students", studentsApi.getAll); // Получить всех студентов
app.get("/api/students/:id", studentsApi.getById);
app.post("/api/students", validate(studentSchemaToCreate), studentsApi.create);
app.put(
  "/api/students/:id",
  validate(studentSchemaToUpdate),
  studentsApi.update
);
app.delete("/api/students/:id", studentsApi.remove);

app.get("/api/teachers", teacherApi.getAll); // Получить всех преподавателей
app.get("/api/teachers/:id", teacherApi.getById);
app.post("/api/teachers", validate(teacherSchemaToCreate), teacherApi.create);
app.put(
  "/api/teachers/:id",
  validate(teacherSchemaToUpdate),
  teacherApi.update
);
app.delete("/api/teachers/:id", teacherApi.remove);

app.get("/api/subjects", subjectsApi.getAll); // Получить все предметы
app.get("/api/subjects/:id", subjectsApi.getById);
app.post("/api/subjects", validate(subjectSchemaToCreate), subjectsApi.create);
app.put(
  "/api/subjects/:id",
  validate(subjectSchemaToUpdate),
  subjectsApi.update
);
app.delete("/api/subjects/:id", subjectsApi.remove);
