import Joi from "joi";

export const teacherSchemaToCreate = Joi.object({
  name: Joi.string()
    .pattern(/^[А-ЯЁ][а-яё]+\s[А-ЯЁ][.][А-ЯЁ][.]$/)
    .required()
    .messages({
      "string.pattern.base": "Неверный формат имени, пример: Иванов И.И.",
    }),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "ru"] },
    })
    .optional()
    .messages({
      "string.email": "Некорректный формат email",
    }),

  phone: Joi.string().min(11).optional().messages({
    "string.min": "Некорректный формат телефона",
  }),
});

export const teacherSchemaToUpdate = Joi.object({
  name: Joi.string().min(4).max(15).optional().messages({
    "string.min": "Имя преподавателя должно содержать не менее 4 символов",
    "string.max": "Имя преподавателя не должно превышать 15 символов",
  }),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "ru"] },
    })
    .optional()
    .messages({
      "string.email": "Некорректный формат email",
    }),

  phone: Joi.string().min(11).optional().messages({
    "string.min": "Некорректный формат телефона",
  }),
});
