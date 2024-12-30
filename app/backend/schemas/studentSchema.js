import Joi from "joi";

export const studentSchemaToCreate = Joi.object({
  group_id: Joi.number().integer().required(),
  subgroup: Joi.number().integer().optional().valid(1, 2).messages({
    "string.valid": "Значение подгруппы может быть в диапозоне 1-2",
  }),
  student_name: Joi.string()
    .min(2)
    .max(30)
    .required()
    .pattern(/^[А-Яа-яёЁ]+$/)
    .messages({
      "string.empty": "Имя не может быть пустым",
      "string.min": "Имя должно содержать минимум 2 символа",
      "string.max": "Имя не может превышать 30 символов",
      "string.pattern.base": "Имя может содержать только буквы",
    }),
  student_surname: Joi.string()
    .min(2)
    .max(30)
    .required()
    .pattern(/^[А-Яа-яёЁ]+$/)
    .messages({
      "string.empty": "Фамилия не может быть пустой",
      "string.min": "Фамилия должна содержать минимум 2 символа",
      "string.max": "Фамилия не может превышать 30 символов",
      "string.pattern.base": "Фамилия может содержать только буквы",
    }),
  student_patronymic: Joi.string()
    .optional()
    .allow("")
    .pattern(/^[А-Яа-яёЁ]*$/)
    .messages({
      "string.pattern.base": "Отчество может содержать только буквы",
    }),
  student_phone: Joi.string()
    .optional()
    .pattern(/^\+?[0-9]{11,15}$/)
    .messages({
      "string.pattern.base":
        "Номер телефона должен быть в формате +71234567890 или 71234567890",
    }),
  student_email: Joi.string()
    .optional()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "ru"] },
    })
    .messages({
      "string.email": "Некорректный формат email",
    }),
  student_tgid: Joi.string()
    .optional()
    .pattern(/^\@[A-Za-z0-9_]+$/)
    .messages({
      "string.pattern.base": "Неверный формат telegram ID, пример: @groupLog",
    }),
});

export const studentSchemaToUpdate = Joi.object({
  group_id: Joi.number().integer().optional(),
  subgroup: Joi.number().integer().optional().valid(1, 2).messages({
    "string.valid": "Значение подгруппы может быть в диапозоне 1-2",
  }),
  student_name: Joi.string()
    .min(2)
    .max(30)
    .optional()
    .pattern(/^[А-Яа-яёЁ]+$/)
    .messages({
      "string.empty": "Имя не может быть пустым",
      "string.min": "Имя должно содержать минимум 2 символа",
      "string.max": "Имя не может превышать 30 символов",
      "string.pattern.base": "Имя может содержать только буквы",
    }),
  student_surname: Joi.string()
    .min(2)
    .max(30)
    .optional()
    .pattern(/^[А-Яа-яёЁ]+$/)
    .messages({
      "string.empty": "Фамилия не может быть пустой",
      "string.min": "Фамилия должна содержать минимум 2 символа",
      "string.max": "Фамилия не может превышать 30 символов",
      "string.pattern.base": "Фамилия может содержать только буквы",
    }),
  student_patronymic: Joi.string()
    .optional()
    .allow("")
    .pattern(/^[А-Яа-яёЁ]*$/)
    .messages({
      "string.pattern.base": "Отчество может содержать только буквы",
    }),
  student_phone: Joi.string()
    .optional()
    .pattern(/^\+?[0-9]{11,15}$/)
    .messages({
      "string.pattern.base":
        "Номер телефона должен быть в формате +71234567890 или 71234567890",
    }),
  student_email: Joi.string()
    .optional()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "ru"] },
    })
    .messages({
      "string.email": "Некорректный формат email",
    }),
  student_tgid: Joi.string()
    .optional()
    .pattern(/^\@[A-Za-z0-9_]+$/)
    .messages({
      "string.pattern.base": "Неверный формат telegram ID, пример: @groupLog",
    }),
});
