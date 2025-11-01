import * as z from "zod";

export const convocationSchema = z.object({
    etudiant: z
        .string()
        .min(1, "L'email de l'étudiant est requis"),
    employer: z
        .string()
        .min(1, "L'email de l'employeur est requis"),
    dateConvocation: z
        .string()
        .min(1, "La date de convocation est requise"),
    location: z
        .string()
        .min(1, "Le lieu de convocation est requis"),
    link: z
        .string()
        .min(1, "Le lien de convocation est requis"),
});
