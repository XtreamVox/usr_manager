import { z } from "zod";
import {
  namesSchema,
  sortOptionSquema,
  validateMongoId,
  cifSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
  listPaginationScheme,
} from "./generalUse.squemes.js";
import {
  buildPaginationAndFilterScheme,
  getSchemaMap,
} from "./mongoToZod.squemes.js";

const clientIdSchema = validateMongoId("ID de cliente no válido");

const companyIdSchema = validateMongoId("ID de empresa no válido");

export const createClientScheme = z.object({
  name: namesSchema,
  cif: cifSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
});

export const ClientPaginationAndFilterScheme = buildPaginationAndFilterScheme(
  getSchemaMap("client"),
);


export const getClientScheme = validateMongoId("ID del cliente no válido");

export const sortDeleteClientScheme = sortOptionSquema;
export const validateDeleteIdScheme = validateMongoId(
  "ID de cliente no válido",
);

export const restoreArchivedProjectScheme = validateMongoId(
  "ID de cliente no válido",
);

export const validateClientIdScheme = validateMongoId("ID de cliente no válido");

export const updateClientDataScheme = z.object({
  name: namesSchema,
  cif: cifSchema,
  emial: emailSchema,
  phone: phoneSchema,
  address: addressSchema
});
 