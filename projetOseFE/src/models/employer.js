import * as z from "zod";

export const employerSchema = z
  .object({
    email: z.string().email("errors.email.invalid"),
    firstName: z.string().min(4, "errors.firstName.min"),
    lastName: z.string().min(2, "errors.lastName.min"),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/,
        "errors.password.regex",
      ),
    confirmPassword: z.string(),
    enterpriseName: z.string().min(2, "errors.enterpriseName.min"),
    phone: z
      .union([
        z.string().regex(/^\d{3}-\d{3}-\d{4}$/, "errors.phone.invalid"),
        z.literal(""),
        z.null(),
      ])
      .transform((val) => (val === "" ? null : val)),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "errors.password.match",
    path: ["confirmPassword"],
  });
