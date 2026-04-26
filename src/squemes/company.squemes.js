import { z } from "zod";
import { namesSchema, cifSchema, addressSchema } from "./generalUse.squemes.js";



const freelanceOnboardingSchema = z.object({
  isFreelance: z.literal(true),
});

const companyOnboardingSchema = z.object({
  isFreelance: z.literal(false),
  name: namesSchema,
  cif: cifSchema,
  address: addressSchema,
});

export const updateCompanyDataSchema = z.discriminatedUnion('isFreelance', [
  freelanceOnboardingSchema,
  companyOnboardingSchema,
]);

export const updateCompanyLogoSchema = z.object({
  fieldname: z.string().min(1, "El campo del archivo es requerido"),
  originalname: z.string().min(1, "El nombre original del archivo es requerido"),
  mimetype: z.enum(
    ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    { errorMap: () => ({ message: 'Solo imágenes (jpeg, png, gif, webp)' }) }
  ),
  size: z.number().max(5 * 1024 * 1024, 'Máximo 5MB')
});
