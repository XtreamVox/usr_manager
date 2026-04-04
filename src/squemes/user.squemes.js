import { z } from "zod";

const emailSchema = z.email("Email no válido").toLowerCase().trim();

// Password seguro
const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Z]/, "Debe contener mayúscula")
  .regex(/[a-z]/, "Debe contener minúscula")
  .regex(/[0-9]/, "Debe contener número");

const namesSchema = z.string().min(2).max(100).trim();

export const registerUserSchema = z.object({
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
  nif: z
    .string()
    .length(9, "El NIF debe tener 9 caracteres")
    .regex(
      /^[0-9]{8}[A-Za-z]$/,
      "El NIF debe tener 8 números seguidos de una letra",
    )
    .transform((val) => val.toUpperCase()),
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
  refreshToken: z.string().regex(/^eyJ/, "Token inválido"),
});

export const deleteUserSchema = z.object({
  soft: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
});

export const inviteUserSchema = z.object({
  email: emailSchema,
});
