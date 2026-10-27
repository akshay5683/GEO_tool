import { z } from "zod";
import { normalizeDomain } from "./domain";
import { COUNTRY_CODES, LANGUAGE_CODES } from "./markets";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email({ message: "Enter a valid email address." }));

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .max(200, "Password must be at most 200 characters.");

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  email: emailSchema,
  password: passwordSchema,
  organizationName: z.string().trim().max(100).optional().default(""),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(200),
});

export const domainSchema = z.string().transform((value, ctx) => {
  const result = normalizeDomain(value);
  if (!result.ok) {
    ctx.addIssue({ code: "custom", message: result.reason });
    return z.NEVER;
  }
  return result.domain;
});

export const createProjectSchema = z.object({
  name: z.string().trim().max(100).optional().default(""),
  domain: domainSchema,
  country: z.enum(COUNTRY_CODES, { message: "Choose a supported country." }),
  languages: z
    .array(z.enum(LANGUAGE_CODES))
    .min(1, "Choose at least one language.")
    .max(4)
    .transform((langs) => [...new Set(langs)]),
});

export const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id.");

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
