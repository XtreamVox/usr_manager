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

const materialSchema = z
  .object({
    unit: z.string(),
    data: z.array(
      z.object({
        name: z.string(),
        quantity: z.number(),
      }),
    ),
  })
  .optional();

const workersSchema = z.object({
  hours: z.number(),
  workers: z.array(
    z.object({
      name: z.string(),
      hours: z.number()
    })
  )
}).optional();

const baseCreateSchema = z.object({
  client: validateMongoId("ID de cliente no válido"),
  project: validateMongoId("ID de project no válido"),
  description: z.string().optional(),
  workDate: z.date().optional(),
})

export const createDeliveryNoteScheme =  z.discriminatedUnion("format", [
  z.object({
    ...baseCreateSchema,
    format: z.literal("material"),
    material: materialSchema,
    workers: z.never()
  }),
    z.object({
    ...baseCreateSchema,
    format: z.literal("hours"),
    material: z.never(),
    workers: workersSchema
  }),
]); 

export const DeliveryNotePaginationAndFilterScheme =
  buildPaginationAndFilterScheme(getSchemaMap("deliveryNote"));

export const validateDeliveryNoteIdScheme = z.object({
  id: validateMongoId("ID del albaran no válido")
})


export const sortDeleteDeliveryNoteScheme = sortOptionSquema;
export const validateDeleteIdScheme = validateMongoId(
  "ID de cliente no válido",
);