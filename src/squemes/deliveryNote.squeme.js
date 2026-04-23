import { z } from 'zod';
import { namesSchema, validateMongoId, cifSchema, emailSchema, phoneSchema, addressSchema, listPaginationScheme, sortOptionSquema } from './generalUse.squemes.js';
import { buildPaginationAndFilterScheme } from './mongoToZod.squemes.js';


export const DeliveryNotePaginationAndFilterScheme = buildPaginationAndFilterScheme(getSchemaMap("client"));
