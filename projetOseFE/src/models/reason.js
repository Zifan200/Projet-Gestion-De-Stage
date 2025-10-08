import { z } from "zod";

export const reasonSchema = z.object({
  reason: z
    .string()
    .min(5, "La raison doit contenir au moins 5 caractères.")
    .max(500, "La raison est trop longue."),
});
