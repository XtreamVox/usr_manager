import { z } from "zod";

export const namesSchema = z.string().min(2).max(100).trim();

export const cifSchema = z
  .string()
  .length(9, "El CIF debe tener 9 caracteres")
  .regex(
    /^[A-Za-z][0-9]{7}[A-Za-z0-9]$/,
    "El CIF debe tener una letra seguida de 7 números y un dígito o letra final",
  )
  .transform((val) => val.toUpperCase());

export const emailSchema = z.email("Email no válido").toLowerCase().trim();

export const addressSchema = z.object({
  street: z.string().min(1, "La calle es requerida"),
  number: z.string().min(1, "El número es requerido"),
  postal: z
    .string()
    .length(5, "El código postal debe tener 5 dígitos")
    .regex(/^[0-9]+$/, "El código postal debe contener solo números"),
  city: z.string().min(1, "La ciudad es requerida"),
  province: z.string().min(1, "La provincia es requerida"),
});

// ASK preguntar cual es el comportamiento default si no se utiliza la query
// Gestionar paginación al listar clientes
export const listPaginationScheme = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  page: z.coerce.number().min(1).default(1),
});

export const nifSchema =  z
    .string()
    .length(9, "El NIF debe tener 9 caracteres")
    .regex(
      /^[0-9]{8}[A-Za-z]$/,
      "El NIF debe tener 8 números seguidos de una letra",
    )
    .transform((val) => val.toUpperCase()),

export const validQueriesKeys = (mongoObject) => z.enum([...mongoObject.schema.obj.keys()]);

export const validateMongoId = (mensaje) => z.string().regex(/^[0-9a-fA-F]{24}$/, mensaje);

export const phoneSchema = z.string().min(7, "El número de teléfono debe tener al menos 7 dígitos").
max(15, "El número de teléfono no puede tener más de 15 dígitos").
regex(/^[0-9]+$/, "El número de teléfono debe contener solo números");

// Password seguro
export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Z]/, "Debe contener mayúscula")
  .regex(/[a-z]/, "Debe contener minúscula")
  .regex(/[0-9]/, "Debe contener número");

