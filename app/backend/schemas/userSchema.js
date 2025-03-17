import Joi from "joi";

export const userRegisterSchema = Joi.object({
  name: Joi.string().min(4).max(15).required().messages({
    "string.empty": "Имя пользователя не может быть пустым",
    "string.min": "Имя пользователя должно содержать не менее 4 символов",
    "string.max": "Имя пользователя не должно превышать 15 символов",
  }),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "ru"] },
    })
    .required()
    .messages({
      "string.empty": "Email не может быть пустым",
      "string.email": "Некорректный формат email",
    }),

  password: Joi.string()
    .min(6)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*.?&])[A-Za-z\d@$!%.*?&]+$/
    )
    .required()
    .messages({
      "string.empty": "Пароль не может быть пустым",
      "string.min": "Пароль должен содержать не менее 6 символов",
      "string.pattern.base":
        "Пароль должен содержать хотя бы одну заглавную и строчную буквы, цифру и один спец. символ",
    }),

  avatar_url: Joi.string().uri().optional().messages({
    "string.uri": "Некорректный URL аватара",
  }),
});

export const userDeleteSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "ru"] },
    })
    .required()
    .messages({
      "string.empty": "Email не может быть пустым",
      "string.email": "Некорректный формат email",
    }),
});

export const userSchemaToUpdate = Joi.object({
  name: Joi.string().min(4).max(15).optional().messages({
    "string.min": "Имя пользователя должно содержать не менее 4 символов",
    "string.max": "Имя пользователя не должно превышать 15 символов",
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

  password: Joi.string()
    .min(6)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*.?&])[A-Za-z\d@$!%.*?&]+$/
    )
    .optional()
    .messages({
      "string.min": "Пароль должен содержать не менее 6 символов",
      "string.pattern.base":
        "Пароль должен содержать хотя бы одну заглавную и строчную буквы, цифру и один спец. символ",
    }),

  avatar_url: Joi.string().uri().optional().messages({
    "string.uri": "Некорректный URL аватара",
  }),
});

export const emailSchema = Joi.string()
  .email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net", "ru"] },
  })
  .messages({
    "string.email": "Некорректный формат email",
  });

// Схема для логина
export const usernameSchema = Joi.string()
  .min(4)
  .max(15)
  .regex(/^[a-zA-Z0-9_-]+$/)
  .messages({
    "string.min": "Логин должен быть не менее 4 символов",
    "string.max": "Логин должен быть не более 15 символов",
    "string.pattern.base": "Логин может содержать только буквы, цифры, _ и -",
  });

export const userLoginSchema = Joi.object({
  userLogin: Joi.alternatives().try(emailSchema, usernameSchema).messages({
    "alternatives.match": "Введите корректный email или логин",
  }),
  password: Joi.string()
    .min(6)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*.?&])[A-Za-z\d@$!%.*?&]+$/
    )
    .required()
    .messages({
      "string.empty": "Пароль не может быть пустым",
      "string.min": "Пароль должен содержать не менее 6 символов",
      "string.pattern.base":
        "Пароль должен содержать хотя бы одну заглавную и строчную буквы, цифру и один спец. символ",
    }),
});
