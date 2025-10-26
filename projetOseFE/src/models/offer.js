import { z } from "zod";
import i18n from "../i18n";

export const getOfferSchema = () =>
    z.object({
        title: z.string().min(1, i18n.t("offer.validation.title_required")),
        description: z.string().min(1, i18n.t("offer.validation.description_required")),
        targetedProgramme: z.string().min(1, i18n.t("offer.validation.program_required")),
        employerEmail: z.string().email(i18n.t("offer.validation.invalid_email")),
        expirationDate: z.string().min(1, i18n.t("offer.validation.expiration_required")),
        startDate: z.string().min(1, i18n.t("offer.validation.start_required")),
        endDate: z.string().min(1, i18n.t("offer.validation.end_required")),
    })
        // Vérifie que endDate >= startDate
        .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
            message: i18n.t("offer.form.end_after_start"),
            path: ["endDate"],
        })
        // Vérifie que expirationDate <= startDate
        .refine((data) => new Date(data.expirationDate) <= new Date(data.startDate), {
            message: i18n.t("offer.form.expiration_before_start"),
            path: ["expirationDate"],
        })
        // ✅ Vérifie que expirationDate >= aujourd'hui
        .refine((data) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // ignore l'heure
            const expiration = new Date(data.expirationDate);
            return expiration >= today;
        }, {
            message: i18n.t("offer.form.expiration_not_past"),
            path: ["expirationDate"],
        });
