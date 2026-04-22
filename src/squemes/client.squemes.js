import { z } from 'zod';
import { namesSchema, validateMongoId, cifSchema, emailSchema, phoneSchema, addressSchema, listPaginationScheme } from './generalUse.squemes.js';
import { getSchemaMap } from './mongoToZod.squemes.js';

const clientIdSchema = validateMongoId("ID de cliente no válido");

const companyIdSchema = validateMongoId("ID de empresa no válido")


export const createClientScheme = z.object({
    user: clientIdSchema,
    company: companyIdSchema,
    name: namesSchema,
    cif: cifSchema,
    email: emailSchema,
    phone: phoneSchema.optional(),
    address: addressSchema.optional()
})

export const paginationAndFilterScheme = z.union([listPaginationScheme, getSchemaMap("client")]);