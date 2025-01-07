import Joi from "joi";

export const subjectSchemaToCreate = Joi.object({
  subject_type: Joi.string()
    .pattern(/л\.|пр\.|уч\.пр\.|лаб\.|конс\.|экз\./)
    .required()
    .messages({
      "string.pattern.base": "Неверный тип предмета",
    }),
  subject_name: Joi.string().required(),
  room: Joi.string()
    .pattern(/\d{4}[а-я]|\d{4}|\d{1} лек|лыж.б/)
    .required()
    .messages({
      "string.pattern.base": "Неверный формат кабинета",
    }),
});

export const subjectSchemaToUpdate = Joi.object({
  subject_type: Joi.string()
    .pattern(/л\.|пр\.|уч\.пр\.|лаб\.|конс\.|экз\./)
    .optional()
    .messages({
      "string.pattern.base": "Неверный тип предмета",
    }),
  subject_name: Joi.string().optional(),
  room: Joi.string()
    .pattern(/\d{4}[а-я]|\d{4}|\d{1} лек|лыж.б/)
    .optional()
    .messages({
      "string.pattern.base": "Неверный формат кабинета",
    }),
});
