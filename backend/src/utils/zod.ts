import { z } from "zod";

export const userSignupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(4).max(15),
  name: z.string().min(3).max(30).optional(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(32, { message: "Password must be at most 32 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least one special character",
    }),
    pfpUrl: z.string().optional()
});

export const userSigninSchema = z.object({
    email: z.string().email().optional(),
    username: z.string().optional(),
    password: z.string()
})
