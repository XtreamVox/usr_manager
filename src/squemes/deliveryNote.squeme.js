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
import { date } from "zod/v3";

const materialSchema = z
  .object({
    unit: z.string(),
    data: z.array(
      z.object({
        name: z.string(),
        quantity: z.number(),
      }),
    ),
  });

const workersSchema = z.object({
  hours: z.number(),
  workers: z.array(
    z.object({
      name: z.string(),
      hours: z.number()
    })
  )
});

const baseCreateSchema = z.object({
  client: mongoIDSchema,
  project: mongoIDSchema,
  description: z.string().optional(),
  workDate: z.string().transform((val) => new Date(val)).optional()
  }
);

export const createDeliveryNoteScheme =  z.discriminatedUnion("format", [
  z.object({
    ...baseCreateSchema.shape,
    format: z.literal("material"),
    material: materialSchema,
    workers: z.never().optional()
  }),
    z.object({
    ...baseCreateSchema.shape,
    format: z.literal("hours"),
    material: z.never().optional(),
    workers: workersSchema
  }),
]); 

export const DeliveryNotePaginationAndFilterScheme =
  buildPaginationAndFilterScheme(getSchemaMap("deliveryNote"));

export const validateDeliveryNoteIdScheme = validateMongoId("ID del albaran no válido");



export const softDeleteDeliveryNoteScheme = softOptionSchema;
export const validateDeleteIdScheme = validateMongoId(
  "ID de cliente no válido",
);