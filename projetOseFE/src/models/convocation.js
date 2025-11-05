import * as z from "zod";

export const convocationSchema = z.object({
    studentEmail: z.string().min(1, "L'email de l'étudiant est requis"),
    employerEmail: z.string().min(1, "L'email de l'employeur est requis"),
    convocationDate: z.string().min(1, "La date de convocation est requise"),
    location: z.string().optional(),
    link: z.string().optional(),
    internshipApplicationId: z.number(),

});
