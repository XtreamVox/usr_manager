import { z } from 'zod';
import { namesSchema, validateMongoId, cifSchema, emailSchema, phoneSchema, addressSchema, listPaginationScheme, sortOptionSquema } from './generalUse.squemes.js';
import { buildPaginationAndFilterScheme } from './mongoToZod.squemes.js';

export const postProjectScheme = z.object({
    user: validateMongoId("ID de usuario no válido"),
    company: validateMongoId("ID de empresa no válido"),
    client: validateMongoId("ID de cliente no válido"),
    name: namesSchema
})

export const updateProjectScheme = z.object({
    id: validateMongoId("ID de proyecto no válido"),
})

export const ProjectPaginationAndFilterScheme = buildPaginationAndFilterScheme(getSchemaMap("project"));

export const getProjectScheme = z.object({
    id: validateMongoId("ID de proyecto no válido"),
})

export const deleteProjectScheme = sortOptionSquema;
export const validateDeleteIdScheme = validateMongoId("ID de proyecto no válido")

export const restoreArchivedProjectScheme = validateMongoId("ID de proyecto no válido");