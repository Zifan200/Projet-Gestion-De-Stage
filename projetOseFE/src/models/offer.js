import { z } from "zod";

export const offerSchema = z
    .object({
      title: z.string().min(1, "Le titre est requis"),
      description: z.string().min(1, "La description est requise"),
      targetedProgramme: z.string().min(1, "Le programme est requis"),
      employerEmail: z.string().email("Email invalide"),
      expirationDate: z.string().min(1, "La date limite est requise"),
      dateDebut: z.string().min(1, "La date de début est requise"),
      dateFin: z.string().min(1, "La date de fin est requise"),
    })
    // dateFin après dateDebut
    .refine(
        (data) => new Date(data.dateFin) >= new Date(data.dateDebut),
        {
          message: "La date de fin doit être postérieure à la date de début",
          path: ["dateFin"],
        }
    )
    // expirationDate avant dateDebut
    .refine(
        (data) => new Date(data.expirationDate) <= new Date(data.dateDebut),
        {
          message: "La date limite doit être avant la date de début du stage",
          path: ["expirationDate"],
        }
    );
