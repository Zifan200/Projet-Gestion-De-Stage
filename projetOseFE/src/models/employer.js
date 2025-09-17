import * as z from 'zod'
export const employerSchema = z.object({
    email: z.string().email(),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    password: z.string().min(6),
    enterpriseName: z.string().min(2),
    phone : z.string().min(10).max(10)
})