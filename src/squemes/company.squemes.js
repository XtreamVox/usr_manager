import { z } from "zod";
import { namesSchema } from "./user.squemes.js";

export const updateCompanyDataSchema = z.object({
  name: namesSchema,
  cif: z
    .string()
    .length(9, "El CIF debe tener 9 caracteres")
    .regex(
      /^[A-Za-z][0-9]{7}[A-Za-z0-9]$/,
      "El CIF debe tener una letra seguida de 7 números y un dígito o letra final",
    )
    .transform((val) => val.toUpperCase()),

  address: z.object({
    street: z.string().min(1),
    number: z.string().min(1),
    postal: z
      .string()
      .length(5, "El código postal debe tener 5 dígitos")
      .regex(/^[0-9]+$/, "El código postal debe contener solo números"),
    city: z.string().min(1),
    province: z.string().min(1),
  }),
  isFreelance: z.boolean(),
});


export const updateCompanyLogoSchema = z.object({
  fieldname: z.string().min(1, "El campo del archivo es requerido"),
  originalname: z.string().min(1, "El nombre original del archivo es requerido"),
  mimetype: z.enum(
    ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    { errorMap: () => ({ message: 'Solo imágenes (jpeg, png, gif, webp)' }) }
  ),
  size: z.number().max(5 * 1024 * 1024, 'Máximo 5MB')
});
