import * as z from "zod";

export const studentSchema = z
  .object({
    firstName: z.string().min(2, "errors.firstName.min"),
    lastName: z.string().min(2, "errors.lastName.min"),
    email: z.string().email("errors.email.invalid"),
    phone: z
      .union([
        z.string().regex(/^\d{3}-\d{3}-\d{4}$/, "errors.phone.invalid"),
        z.literal(""),
        z.null(),
      ])
      .transform((val) => (val === "" ? null : val)),
    adresse: z.string().min(2, "errors.adresse.min"),
    program: z.string().min(1, "errors.program.required"),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/,
        "errors.password.regex",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "errors.password.match",
    path: ["confirmPassword"],
  });
