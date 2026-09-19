import { z } from "zod";

const strictPhone = z.string().transform((val) => val.replace(/[^0-9]/g, "").trim());

const fruitPassword = z
  .string()
  .trim()
  .transform((val) => val.replace(/[-_\s]/g, ""))
  .pipe(
    z
      .string()
      .length(4, { message: "Фруктовый пароль должен состоять строго из 4 символов" })
      .regex(/^[0-9]+$/, { message: "Фруктовый пароль должен содержать только цифры" })
  );

export const phoneCheckSchema = z.object({ phone: strictPhone });
export const loginSchema = z.object({ phone: strictPhone, password: z.string().min(4) });
export const registerSchema = z.object({ name: z.string().min(2), phone: strictPhone });
export const smsPhoneSchema = z.object({ phone: strictPhone, chosenPetName: z.string().optional() });
export const verifySmsSchema = z.object({ phone: strictPhone, code: z.string() });

export const verifyFruitSchema = z.object({
  phone: strictPhone,
  fruitCode: fruitPassword,
  petName: z.string().optional()
});
