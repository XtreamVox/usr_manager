import { ZodError } from 'zod';
//import { ApiError } from './errorHandler.js';

export const validate = ({ body, query, params }) => async (req, res, next) => {
  try {
    if (body) req.body = await body.parseAsync(req.body);
  
    if (query) {
      const parsedQuery = await query.parseAsync(req.query);
      Object.assign(req.query, parsedQuery);
    }

    if (params) {
      const parsedParams = await params.parseAsync(req.params);
      Object.assign(req.params, parsedParams);
    }

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((err) => ({
        campo: err.path.join('.'),
        mensaje: err.message,
      }));

      // TODO hacer ApiError
      //return ApiError.badRequest("Error de validación", errors);
      return console.log(errors);
    }
    next(error);
  }
};

// Middleware para validar archivo
export const validateFile = (schema) => (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: true, message: "Archivo requerido" });
  }

  const result = schema.safeParse(req.file);

  if (!result.success) {
    return res.status(400).json({
      error: true,
      message: result.error.errors[0].message,
    });
  }

  next();
};
