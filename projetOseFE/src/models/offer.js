import { z } from "zod";

export const offerSchema = z.object({
  title: z.string().min(1, "offer.validation.title_required"),
  description: z.string().min(1, "offer.validation.description_required"),
  targetedProgramme: z.string().min(1, "offer.validation.program_required"),
  employerEmail: z.email("offer.validation.invalid_email"),
  expirationDate: z.string().min(1, "offer.validation.expiration_required"),
});
