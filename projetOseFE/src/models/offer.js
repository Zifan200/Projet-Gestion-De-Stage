import { z } from "zod";

export const offerSchema = z.object({
  title: z
    .string()
    .min(1, "employer_dashboard_add_intership:validation.title_required"),
  description: z
    .string()
    .min(1, "employer_dashboard_add_intership:validation.description_required"),
  targetedProgramme: z
    .string()
    .min(1, "employer_dashboard_add_intership:validation.program_required"),
  employerEmail: z
    .string()
    .email("employer_dashboard_add_intership:validation.invalid_email"),
  expirationDate: z
    .string()
    .min(1, "employer_dashboard_add_intership:validation.expiration_required"),
});
