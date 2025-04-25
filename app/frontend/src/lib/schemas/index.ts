import * as z from "zod";

export const userEmailSchema = z
  .string()
  .email({ message: "Некорректный формат email" }) // Проверка на формат email
  .refine(
    (email) => {
      const domain = email.split("@")[1];
      const allowedTlds = ["com", "net", "ru"];
      return domain && allowedTlds.some((tld) => domain.endsWith(`.${tld}`));
    },
    { message: "Домен почты должен быть одним из: com, net, ru" } // Кастомная проверка TLD
  );

export const userNameSchema = z
  .string()
  .min(4, {
    message: "Логин пользователя должен содержать не менее 4 символов",
  })
  .max(15, {
    message: "Логин пользователя не должен превышать 15 символов",
  })
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Логин может состоять только из букв латиницы, цифр и знаков 'тире', 'нижнего подчеркивания'"
  );

const passwordSchema = z
  .string()
  .min(6, { message: "Пароль должен состоять минимум из 6 символов" })
  .refine((val) => passwordValidationRegex.test(val), {
    message:
      "Пароль должен содержать хотя бы одну цифру, заглавную и строчную буквы, и один спец. символ",
  });

const passwordValidationRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*.:-_?&])[A-Za-z\d@$!%*.:-_?&]+$/;

export const LoginSchema = z.object({
  userLogin: z.union([userEmailSchema, userNameSchema]),
  password: passwordSchema,
});

export const RegisterSchema = z.object({
  name: userNameSchema,
  email: userEmailSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
});
