import Joi from "joi";

export const groupSchemaToCreate = Joi.object({
  group_name: Joi.string()
    .pattern(/^[А-Яа-я]{3,7}-\d{3}$/)
    .required(),

  curator_id: Joi.number().integer().required(),
});

export const groupSchemaToUpdate = Joi.object({
  group_name: Joi.string()
    .pattern(/^[А-Яа-я]{3,7}-\d{3}$/)
    .optional(),

  curator_id: Joi.number().integer().optional(),
});
