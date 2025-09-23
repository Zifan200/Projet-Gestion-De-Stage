import * as z from 'zod'
export const requestPasswordSchema = z.object({
    email: z.email("Email est invalide"),
})

export const resetPasswordSchema = z.object({
    password: z
        .string()
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/,
            "Le mot de passe doit contenir entre 8 et 50 caractères, avec au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)"
        ),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
})