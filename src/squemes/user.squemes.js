import { z } from "zod";
import { namesSchema, nifSchema, passwordSchema, emailSchema, softOptionSchema } from "./generalUse.squemes.js";

export const registerUserSchema = z.object({
  name: namesSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const doubleStepVerificationSchema = z.object({
  code: z
    .string()
    .length(6, "El código de verificación debe tener 6 caracteres"),
});

export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contraseña es requerida"),
});

export const updateUserDataSchema = z.object({
  name: namesSchema,
  lastName: namesSchema,
  nif: nifSchema,
});

export const changeUserPasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "La nueva contraseña debe ser diferente de la actual",
    path: ["newPassword"],
  });

export const refreshUserSessionSchema = z.object({
  refreshToken: z.string(),
});

export const deleteUserSchema = softOptionSchema;

export const inviteUserSchema = z.object({
  email: emailSchema,
  name: namesSchema,
  lastName: namesSchema,
  password: passwordSchema,
});
