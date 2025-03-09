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
  console.log("Starting the server..");
  error ? console.log(error) : console.log(`Listening port ${PORT}`);
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

app.get("/api/parser/:group/:week", scheduleApi.getWeeklySchedule);
app.get("/api/parser/:group/:week/:day", scheduleApi.getDailySchedule);
app.post("/api/parser/:group/:week", scheduleApi.createSchedule);

app.get("api/admin/user", userApi.getByEmail);
app.delete("api/admin/user", validate(userDeleteSchema), userApi.remove);

app.post(
  "/api/user/registration",
  validate(userRegisterSchema),
  userApi.registration
);
app.post("/api/user/login", validate(userLoginSchema), userApi.login);
app.post("/api/user/logout", userApi.logout);
app.put("/api/user/update", validate(userSchemaToUpdate), userApi.update);
app.post("/api/user/id/:id/avatar", userApi.uploadAvatar);

// Группы
app.get("/api/group", groupApi.getAll);
app.get("/api/group/id/:id", groupApi.getById);
app.post("/api/group", validate(groupSchemaToCreate), groupApi.create);
app.put("/api/group/id/:id", validate(groupSchemaToUpdate), groupApi.update);
app.delete("/api/group/id/:id", groupApi.remove);

// Студенты
app.get("/api/student", studentsApi.getAll);
app.get("/api/student/id/:id", studentsApi.getById);
app.post(
  "/api/student",
  validate(studentsArraySchemaToCreate),
  studentsApi.create
);
app.get("/api/student/group/:group", studentsApi.getByGroup);
app.put(
  "/api/student/:group/:id",
  validate(studentSchemaToUpdate),
  studentsApi.update
);
app.delete("/api/student/id/:id", studentsApi.remove);

// Преподаватели
app.get("/api/teacher", teacherApi.getAll);
app.get("/api/teacher/id/:id", teacherApi.getById);
app.post("/api/teacher", validate(teacherSchemaToCreate), teacherApi.create);
app.put(
  "/api/teacher/id/:id",
  validate(teacherSchemaToUpdate),
  teacherApi.update
);
app.delete("/api/teacher/id/:id", teacherApi.remove);

// Предметы
app.get("/api/subject", subjectsApi.getAll);
app.get("/api/subject/id/:id", subjectsApi.getById);
app.post("/api/subject", validate(subjectSchemaToCreate), subjectsApi.create);
app.put(
  "/api/subject/id/:id",
  validate(subjectSchemaToUpdate),
  subjectsApi.update
);
app.delete("/api/subject/id/:id", subjectsApi.remove);

// Посещаемость
app.get("/api/attendance", attendanceApi.getAll);
app.get("/api/attendance/id/:id", attendanceApi.getById);
app.post(
  "/api/attendance",
  validate(attendanceSchemaToCreate),
  attendanceApi.create
);
app.put(
  "/api/attendance/id/:id",
  validate(attendanceSchemaToUpdate),
  attendanceApi.update
);
app.delete("/api/attendance/id/:id", attendanceApi.remove);
