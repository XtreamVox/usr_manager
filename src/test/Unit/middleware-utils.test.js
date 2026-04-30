import mongoose from "mongoose";
import { describe, expect, it, jest, beforeEach, afterEach } from "@jest/globals";
import {
  allowedFields,
  limitStringLength,
  sanitizeBody,
} from "../../middleware/sanitize.middleware.js";
import {
  errorHandler,
  notFound,
} from "../../middleware/error-handler.middleware.js";
import { AppError } from "../../utils/AppError.js";

const createRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
};

describe("sanitize middleware", () => {
  it("removes Mongo operators deeply and calls next", () => {
    const req = {
      body: {
        name: "Ada",
        $where: "this.password",
        nested: { $gt: "", ok: true },
      },
    };
    const next = jest.fn();

    sanitizeBody(req, {}, next);

    expect(req.body).toEqual({ name: "Ada", nested: { ok: true } });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("handles missing body", () => {
    const next = jest.fn();

    sanitizeBody({}, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("truncates long strings recursively", () => {
    const req = {
      body: {
        title: "abcdef",
        nested: { note: "123456", count: 2 },
      },
    };
    const next = jest.fn();

    limitStringLength(3)(req, {}, next);

    expect(req.body).toEqual({ title: "abc", nested: { note: "123", count: 2 } });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("keeps only allowed fields", () => {
    const req = { body: { name: "Ada", role: "admin", ignored: true } };
    const next = jest.fn();

    allowedFields("name", "role", "missing")(req, {}, next);

    expect(req.body).toEqual({ name: "Ada", role: "admin" });
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe("error middleware", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.NODE_ENV;
  });

  it("creates a not found AppError", () => {
    const next = jest.fn();

    notFound({ method: "GET", originalUrl: "/missing" }, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
      message: "Ruta GET /missing no encontrado",
    });
  });

  it("serializes operational errors with details", () => {
    const res = createRes();
    const err = AppError.validation("Datos inválidos", [{ field: "email" }]);

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      message: "Datos inválidos",
      code: "VALIDATION_ERROR",
      details: [{ field: "email" }],
    });
  });

  it("serializes mongoose validation errors", () => {
    const res = createRes();
    const err = new mongoose.Error.ValidationError();
    err.addError("email", new mongoose.Error.ValidatorError({
      path: "email",
      message: "Email requerido",
    }));

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      message: "Error de validación de mongoose",
      code: "VALIDATION_ERROR",
      details: [{ field: "email", message: "Email requerido" }],
    });
  });

  it("serializes cast, duplicate, zod and multer errors", () => {
    const cases = [
      [
        new mongoose.Error.CastError("ObjectId", "bad-id", "_id"),
        400,
        { error: true, message: "Valor inválido para '_id'", code: "CAST_ERROR" },
      ],
      [
        { code: 11000, keyValue: { email: "ada@example.com" }, message: "dup" },
        409,
        {
          error: true,
          message: "Ya existe un registro con ese 'email'",
          code: "DUPLICATE_KEY",
        },
      ],
      [
        {
          name: "ZodError",
          message: "zod",
          errors: [{ path: ["name"], message: "Requerido" }],
        },
        400,
        {
          error: true,
          message: "Error de validación de zod",
          code: "VALIDATION_ERROR",
          details: [{ field: "name", message: "Requerido" }],
        },
      ],
      [
        { code: "LIMIT_FILE_SIZE", message: "big" },
        400,
        { error: true, message: "Archivo muy grande", code: "FILE_TOO_LARGE" },
      ],
      [
        { code: "LIMIT_FILE_COUNT", message: "many" },
        400,
        { error: true, message: "Demasiados archivos", code: "TOO_MANY_FILES" },
      ],
    ];

    for (const [err, status, body] of cases) {
      const res = createRes();
      errorHandler(err, {}, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.json).toHaveBeenCalledWith(body);
    }
  });

  it("hides unexpected error details in production", () => {
    process.env.NODE_ENV = "production";
    const res = createRes();

    errorHandler(new Error("boom"), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      message: "Error interno del servidor",
      code: "INTERNAL_ERROR",
    });
  });

  it("includes unexpected error details outside production", () => {
    const res = createRes();
    const err = new Error("boom");
    err.stack = "stack";

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      message: "boom",
      code: "INTERNAL_ERROR",
      stack: "stack",
    });
  });
});

describe("AppError factories", () => {
  it("builds common HTTP errors", () => {
    expect(AppError.badRequest()).toMatchObject({ statusCode: 400, code: "BAD_REQUEST" });
    expect(AppError.unauthorized()).toMatchObject({ statusCode: 401, code: "UNAUTHORIZED" });
    expect(AppError.forbidden()).toMatchObject({ statusCode: 403, code: "FORBIDDEN" });
    expect(AppError.conflict()).toMatchObject({ statusCode: 409, code: "CONFLICT" });
    expect(AppError.tooManyRequests()).toMatchObject({ statusCode: 429, code: "RATE_LIMIT" });
    expect(AppError.internal()).toMatchObject({ statusCode: 500, code: "INTERNAL_ERROR" });
  });
});
