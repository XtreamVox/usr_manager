import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validate = ({ body, query, params }) => async (req, res, next) => {
  try {

    if (body) {
      req.body = await body.parseAsync(req.body);
    }
  
    if (query) {
      const parsedQuery = await query.parseAsync(req.query);
      Object.defineProperty(req, "query", {
        value: parsedQuery,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    if (params) {
      const parsedParams = await params.parseAsync(req.params);
      Object.assign(req.params, parsedParams);
    }

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return next(AppError.validation("Error de validación", details));
    }
    next(error);
  }
};

// Middleware para validar archivo
export const validateFile = (schema) => (req, res, next) => {
  try {
    if (!req.file) {
      throw AppError.badRequest("Archivo requerido");
    }

    const result = schema.safeParse(req.file);

    if (!result.success) {
      throw AppError.badRequest(result.error.errors[0].message);
    }

    next();
  } catch (error) {
    next(error);
  }
};
