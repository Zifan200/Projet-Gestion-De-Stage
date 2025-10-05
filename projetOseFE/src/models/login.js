import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email("errors.email.invalid"),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/,
      "errors.password.regex",
    ),
});
