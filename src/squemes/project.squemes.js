import { z } from "zod";
import {
  namesSchema,
  validateMongoId,
  cifSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
  listPaginationScheme,
  sortOptionSquema,
} from "./generalUse.squemes.js";
import {
  buildPaginationAndFilterScheme,
  getSchemaMap,
} from "./mongoToZod.squemes.js";

export const postProjectScheme = z.object({
  client: validateMongoId("ID de cliente no válido"),
  name: namesSchema,
  email: emailSchema.optional(),
  address: addressSchema.optional(),
  notes: z.string().optional(),
  active: z.boolean().optional()
});

export const updateProjectIdScheme = z.object({
  id: validateMongoId("ID de proyecto no válido"),
});

// reasignar el project a un nuevo usuario si lo hace el admin
export const updateProjectBodyScheme = z.object({
  user: validateDeleteIdScheme("ID de usuario no válido").optional(),
  client: validateMongoId("ID de cliente no válido").optional(),
  name: namesSchema.optional(),
  email: emailSchema.optional(),
  address: addressSchema.optional(),
  notes: z.string().optional(),
  active: z.boolean().optional()
})

export const ProjectPaginationAndFilterScheme = buildPaginationAndFilterScheme(
  getSchemaMap("project"),
);

export const getProjectScheme = z.object({
  id: validateMongoId("ID de proyecto no válido"),
});

export const deleteProjectScheme = sortOptionSquema;
export const validateDeleteIdScheme = validateMongoId(
  "ID de proyecto no válido",
);

export const restoreArchivedProjectScheme = validateMongoId(
  "ID de proyecto no válido",
);
