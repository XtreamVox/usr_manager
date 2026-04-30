import { z } from "zod";
import {
  namesSchema,
  validateMongoId,
  cifSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
  softOptionSchema,
  mongoIDSchema,
} from "./generalUse.squemes.js";
import {
  buildPaginationAndFilterScheme,
  getSchemaMap,
} from "./mongoToZod.squemes.js";

export const createProjectScheme = z.object({
  client: mongoIDSchema,
  name: namesSchema,
  email: emailSchema,
  address: addressSchema.optional(),
  notes: z.string().optional(),
  active: z.boolean().optional()
});

export const updateProjectIdScheme = validateMongoId("ID de proyecto no válido");

// reasignar el project a un nuevo usuario si lo hace el admin
export const updateProjectBodyScheme = z.object({
  user: mongoIDSchema.optional(),
  client: mongoIDSchema.optional(),
  name: namesSchema.optional(),
  email: emailSchema.optional(),
  address: addressSchema.optional(),
  notes: z.string().optional(),
  active: z.boolean().optional()
})

export const ProjectPaginationAndFilterScheme = buildPaginationAndFilterScheme(
  getSchemaMap("project"),
);

export const getProjectScheme =  validateMongoId("ID de proyecto no válido");

export const softDeleteProjectScheme = softOptionSchema;
export const validateDeleteIdScheme = validateMongoId(
  "ID de proyecto no válido",
);

export const restoreArchivedProjectScheme = validateMongoId(
  "ID de proyecto no válido",
);
