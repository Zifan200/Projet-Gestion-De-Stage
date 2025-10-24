import { z } from "zod";
import i18n from "../i18n";

export const getOfferSchema = () =>
    z.object({
      title: z.string().min(1, i18n.t("offer.validation.title_required")),
      description: z.string().min(1, i18n.t("offer.validation.description_required")),
      targetedProgramme: z.string().min(1, i18n.t("offer.validation.program_required")),
      employerEmail: z.string().email(i18n.t("offer.validation.invalid_email")),
      expirationDate: z.string().min(1, i18n.t("offer.validation.expiration_required")),
      dateDebut: z.string().min(1, i18n.t("offer.validation.start_required")),
      dateFin: z.string().min(1, i18n.t("offer.validation.end_required")),
    })
        .refine(
            (data) => new Date(data.dateFin) >= new Date(data.dateDebut),
            { message: i18n.t("offer.form.end_after_start"), path: ["dateFin"] }
        )
        .refine(
            (data) => new Date(data.expirationDate) <= new Date(data.dateDebut),
            { message: i18n.t("offer.form.expiration_before_start"), path: ["expirationDate"] }
        );
