import * as z from 'zod'
export const employerSchema = z.object({
    email: z.email("Email est invalide"),
    firstName: z.string().min(4, "Prénom minimum 4 charactères"),
    lastName: z.string().min(2, "Nom de famille minimum 4 charactères"),
    password: z
        .string()
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/,
            "Le mot de passe doit contenir entre 8 et 50 caractères, avec au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)"
        ),
    confirmPassword: z.string(),
    enterpriseName: z.string().min(2),
    phone : z.union([
        z.string().regex(/^\d{10}$/, "Le numéro doit contenir exactement 10 chiffres"),
        z.literal(""),
        z.null(),
    ])
        .transform((val) => (val === "" ? null : val)),
}).refine((data) => data.password === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
    })