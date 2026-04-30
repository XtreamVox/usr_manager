import { z } from "zod";
import Client from "../models/client.models.js";
import User from "../models/user.models.js";
import Company from "../models/company.models.js";
import Project from "../models/project.models.js";
import { AppError } from "../utils/AppError.js";
import DeliveryNote from "../models/deliveryNote.models.js";

// Gestionar paginación al listar clientes
const listPaginationScheme = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  page: z.coerce.number().min(1).default(1),
});

const modelTypeToZod = (instance, path) => {
  switch (instance) {
    case "String":
      return path.enumValues?.length ? z.enum(path.enumValues) : z.string();

    case "Number":
      return z.coerce.number();

    case "Boolean":
      return z.coerce.boolean();

    case "Date":
      return z.coerce.date();

    default:
      return z.any();
  }
};

const buildSchemaMap = (schemaPaths, mapper) =>
  Object.fromEntries(
    Object.entries(schemaPaths)
      .filter(([key]) => !key.startsWith("_") && key !== "__v" && key !== "company")
      .map(([key, path]) => [key, mapper(path.instance, path)]),
  );

export const getSchemaMap = (model) => {
  switch (model) {
    case "client":
      return buildSchemaMap(Client.schema.paths, modelTypeToZod);

    case "user":
      return buildSchemaMap(User.schema.paths, modelTypeToZod);

    case "company":
      return buildSchemaMap(Company.schema.paths, modelTypeToZod);
    
    case "project":
      return buildSchemaMap(Project.schema.paths, modelTypeToZod);

    case "deliveryNote":
      return buildSchemaMap(DeliveryNote.schema.paths, modelTypeToZod);

    default:
      //throw AppError.forbidden("Modelo no soportado");
  }
};

const schemaPaths = Object.keys(Client.schema.paths);

const validSortKeys = schemaPaths.filter(
  k => !k.startsWith("_") && k !== "__v"
);

const sortSchema = z
  .string()
  .refine((val) => {
    const key = val.startsWith("-") ? val.slice(1) : val;
    return validSortKeys.includes(key);
  }, "Invalid sort field")
  .transform((val) => {
    if (val.startsWith("-")) {
      return { [val.slice(1)]: -1 };
    }
    return { [val]: 1 };
  });

export const buildPaginationAndFilterScheme = (schemaMap) =>
  z
    .object({})
    .catchall(z.string())
    .transform((data, ctx) => {
      const parsed = {
        limit: 10,
        page: 1,
        sort: { createdAt: -1 },
        filters: {},
      };

      for (const [key, value] of Object.entries(data)) {
        // limit y page
        if (key === "limit" || key === "page") {
          const result = listPaginationScheme.shape[key].safeParse(value);

          if (!result.success) {
            result.error.issues.forEach(issue =>
              ctx.addIssue({
                ...issue,
                path: [key],
              })
            );
            continue;
          }

          parsed[key] = result.data;
          continue;
        }

        // sort
        if (key === "sort") {
          const sortKey = value.startsWith("-") ? value.slice(1) : value;

          if (!(sortKey in schemaMap)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Sort inválido: ${value}`,
              path: ["sort"],
            });
            continue;
          }

          parsed.sort = {
            [sortKey]: value.startsWith("-") ? -1 : 1,
          };
          continue;
        }

        if (key === "from" || key === "to") {
          const result = z.coerce.date().safeParse(value);

          if (!result.success) {
            result.error.issues.forEach(issue =>
              ctx.addIssue({
                ...issue,
                path: [key],
              })
            );
            continue;
          }

          parsed[key] = result.data;
          continue;
        }

        // filtros
        if (!(key in schemaMap)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Filtro inválido: ${key}`,
            path: [key],
          });
          continue;
        }

        const result = schemaMap[key].safeParse(value);

        if (!result.success) {
          result.error.issues.forEach(issue =>
            ctx.addIssue({
              ...issue,
              path: [key],
            })
          );
          continue;
        }

        parsed.filters[key] = result.data;
      }

      return parsed;
    });
