import Joi from "joi";

export const attendanceSchemaToCreate = Joi.object({
  student_id: Joi.number().integer().positive().required().messages({
    "any.required": "Поле 'student_id' обязательно для заполнения.",
    "number.base": "Поле 'student_id' должно быть числом.",
    "number.positive": "Поле 'student_id' должно быть положительным числом.",
  }),
  lessons_schedule_id: Joi.number().integer().positive().required().messages({
    "any.required": "Поле 'lessons_schedule_id' обязательно для заполнения.",
    "number.base": "Поле 'lessons_schedule_id' должно быть числом.",
    "number.positive":
      "Поле 'lessons_schedule_id' должно быть положительным числом.",
  }),
  attendance_status: Joi.string().valid("Б", "Н", "УП").required().messages({
    "any.required": "Поле 'attendance_status' обязательно для заполнения.",
    "string.base": "Поле 'attendance_status' должно быть строкой.",
    "any.only":
      "Поле 'attendance_status' должно быть одним из значений: 'Б', 'Н', 'УП'.",
  }),
  day_schedule_id: Joi.number().integer().positive().required().messages({
    "any.required": "Поле 'day_schedule_id' обязательно для заполнения.",
    "number.base": "Поле 'day_schedule_id' должно быть числом.",
    "number.positive":
      "Поле 'day_schedule_id' должно быть положительным числом.",
  }),
});

export const attendanceSchemaToUpdate = Joi.object({
  attendance_status: Joi.string().valid("Б", "Н", "УП").optional().messages({
    "string.base": "Поле 'attendance_status' должно быть строкой.",
    "any.only":
      "Поле 'attendance_status' должно быть одним из значений: 'Б', 'Н', 'УП'.",
  }),
  day_schedule_id: Joi.number().integer().positive().required().messages({
    "any.required": "Поле 'day_schedule_id' обязательно для заполнения.",
    "number.base": "Поле 'day_schedule_id' должно быть числом.",
    "number.positive":
      "Поле 'day_schedule_id' должно быть положительным числом.",
  }),
  lessons_schedule_id: Joi.number().integer().positive().required().messages({
    "any.required": "Поле 'lessons_schedule_id' обязательно для заполнения.",
    "number.base": "Поле 'lessons_schedule_id' должно быть числом.",
    "number.positive":
      "Поле 'lessons_schedule_id' должно быть положительным числом.",
  }),
})
  .or("attendance_status", "day_schedule_id", "lessons_schedule_id")
  .messages({
    "object.missing":
      "Хотя бы одно из полей 'attendance_status', 'day_schedule_id' или 'lessons_schedule_id' должно быть указано.",
  });
