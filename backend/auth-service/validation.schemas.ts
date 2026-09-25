import { z } from "zod";
import { getNormalizedPhone } from "../shared/utils";

// Железобетонный препроцессор, который состыкуется с фронтендом:
// Если фронт присылает 11 цифр (например, 79991112233), мы оставляем 11 цифр.
// Если прилетает 10 цифр, мы приписываем 7 в начало, чтобы бэк и фронт понимали друг друга!
const cleanPhoneForZod = (val: unknown) => {
  if (typeof val !== "string") return val;
  const digits = val.replace(/\D/g, ""); // Оставляем только цифры
  if (digits.length === 10) {
    return "7" + digits;
  }
  return digits;
};

// Валидируем строку из 11 цифр, которая начинается на 7
const phone = z.preprocess(
  cleanPhoneForZod,
  z.string()
    .length(11, { message: "Номер должен содержать ровно 11 цифр (с 7 в начале)" })
    .transform((v) => getNormalizedPhone(v))
);

export const phoneCheckSchema = z.object({ phone });
export const smsPhoneSchema = z.object({ phone, chosenPetName: z.string().optional() });
export const verifySmsSchema = z.object({ phone, code: z.string() });
export const verifyFruitSchema = z.object({ sessionId: z.string(), phone, fruitCode: z.string(), petName: z.string().optional() });
export const petStatsSchema = z.object({ petHealth: z.number(), petExperience: z.number(), petStars: z.number(), petIndex: z.number() });
