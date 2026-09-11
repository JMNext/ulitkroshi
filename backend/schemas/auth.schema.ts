import { z } from "zod";

export const loginSchema = z.object({
  phone: z.string().min(6, "Неверный формат телефона"),
  password: z.string().min(4, "Пароль слишком короткий")
});

export const registerSchema = z.object({
  name: z.string().min(2, "Имя слишком короткое"),
  phone: z.string().min(6, "Неверный формат телефона")
});
