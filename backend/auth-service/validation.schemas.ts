import { z } from "zod";
import { getNormalizedPhone } from "../shared/utils";

const phone = z.string().transform((v) => getNormalizedPhone(v));

export const phoneCheckSchema = z.object({ phone });
export const smsPhoneSchema = z.object({ phone, chosenPetName: z.string().optional() });
export const verifySmsSchema = z.object({ phone, code: z.string() });
export const verifyFruitSchema = z.object({ sessionId: z.string(), phone, fruitCode: z.string(), petName: z.string().optional() });
export const petStatsSchema = z.object({ petHealth: z.number(), petExperience: z.number(), petStars: z.number(), petIndex: z.number() });
