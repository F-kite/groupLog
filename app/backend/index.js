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
import attendanceApi from "./api/attendance.js";

import {
  groupSchemaToCreate,
  groupSchemaToUpdate,
} from "./schemas/groupSchema.js";

import {
  studentSchemaToUpdate,
  studentsArraySchemaToCreate,
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

import {
  attendanceSchemaToCreate,
  attendanceSchemaToUpdate,
} from "./schemas/attendanceSchema.js";

const app = express();
const PORT = process.env.PORT || 3001;

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
  error ? console.log(error) : console.log(`THE SERVER IS RUNNING`);
});

app.get("/ping", (req, res) => {
  res.status(200).json({ message: "Server worked" });
});

app.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Добро пожаловать на защищенную страницу",
  });
});

app.post("/api/refresh-token", dbApi.refreshAuthToken);

/*
post - создание со статусом 201 после успешного выполнения
put - обновление записи
*/

app.get("/api/schedule/:group/:week", scheduleApi.getWeeklySchedule);
app.get("/api/schedule/:group/:week/:day", scheduleApi.getDailySchedule);
app.post("/api/schedule/:group/:week", scheduleApi.createSchedule);

app.get("api/admin/users", userApi.getByEmail);
app.delete("api/admin/users", validate(userDeleteSchema), userApi.remove);

app.post(
  "/api/user/registration",
  validate(userRegisterSchema),
  userApi.registration
);
app.post("/api/users/login", validate(userLoginSchema), userApi.login);
app.post("/api/users/logout", userApi.logout);
app.put("/api/users/update", validate(userSchemaToUpdate), userApi.update);
app.post("/api/users/id/:id/avatar", userApi.uploadAvatar);

// Группы
app.get("/api/groups", groupApi.getAll);
app.get("/api/groups/id/:id", groupApi.getById);
app.post("/api/groups", validate(groupSchemaToCreate), groupApi.create);
app.put("/api/groups/id/:id", validate(groupSchemaToUpdate), groupApi.update);
app.delete("/api/groups/id/:id", groupApi.remove);

// Студенты
app.get("/api/students", studentsApi.getAll);
app.get("/api/students/id/:id", studentsApi.getById);
app.post(
  "/api/students",
  validate(studentsArraySchemaToCreate),
  studentsApi.create
);
app.get("/api/students/groups/:group", studentsApi.getByGroup);
app.put(
  "/api/students/:groups/:id",
  validate(studentSchemaToUpdate),
  studentsApi.update
);
app.delete("/api/students/id/:id", studentsApi.remove);

// Преподаватели
app.get("/api/teachers", teacherApi.getAll);
app.get("/api/teachers/id/:id", teacherApi.getById);
app.post("/api/teachers", validate(teacherSchemaToCreate), teacherApi.create);
app.put(
  "/api/teachers/id/:id",
  validate(teacherSchemaToUpdate),
  teacherApi.update
);
app.delete("/api/teachers/id/:id", teacherApi.remove);

// Предметы
app.get("/api/subjects", subjectsApi.getAll);
app.get("/api/subjects/id/:id", subjectsApi.getById);
app.post("/api/subjects", validate(subjectSchemaToCreate), subjectsApi.create);
app.put(
  "/api/subjects/id/:id",
  validate(subjectSchemaToUpdate),
  subjectsApi.update
);
app.delete("/api/subjects/id/:id", subjectsApi.remove);

// Посещаемость
app.get("/api/attendances", attendanceApi.getAll);
app.get("/api/attendances/id/:id", attendanceApi.getById);
app.get("/api/attendances/groups/:group", attendanceApi.getByGroup);
app.get("/api/attendances/students/:student", attendanceApi.getByStudent);
app.post(
  "/api/attendances",
  validate(attendanceSchemaToCreate),
  attendanceApi.create
);
app.put(
  "/api/attendances/id/:id",
  validate(attendanceSchemaToUpdate),
  attendanceApi.update
);
app.delete("/api/attendances/id/:id", attendanceApi.remove);
