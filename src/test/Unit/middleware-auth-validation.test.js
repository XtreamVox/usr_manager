import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { z } from "zod";
import checkRol from "../../middleware/role.middleware.js";
import checkStatus from "../../middleware/status.middleware.js";
import { validate, validateFile } from "../../middleware/validate.middleware.js";

describe("role and status middleware", () => {
  it("allows matching roles and statuses", () => {
    const nextRole = jest.fn();
    const nextStatus = jest.fn();

    checkRol(["admin", "user"])({ user: { role: "admin" } }, {}, nextRole);
    checkStatus("verified")({ user: { status: "verified" } }, {}, nextStatus);

    expect(nextRole).toHaveBeenCalledWith();
    expect(nextStatus).toHaveBeenCalledWith();
  });

  it("rejects missing users and unauthorized values", () => {
    const nextMissingRole = jest.fn();
    const nextBadRole = jest.fn();
    const nextMissingStatus = jest.fn();
    const nextBadStatus = jest.fn();

    checkRol("admin")({}, {}, nextMissingRole);
    checkRol("admin")({ user: { role: "user" } }, {}, nextBadRole);
    checkStatus("verified")({}, {}, nextMissingStatus);
    checkStatus(["verified"])({ user: { status: "pending" } }, {}, nextBadStatus);

    expect(nextMissingRole.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
    expect(nextBadRole.mock.calls[0][0]).toMatchObject({ statusCode: 403 });
    expect(nextMissingStatus.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
    expect(nextBadStatus.mock.calls[0][0]).toMatchObject({ statusCode: 403 });
  });
});

describe("validate middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("parses body, query and params", async () => {
    const req = {
      body: { name: "Ada" },
      query: { limit: "10" },
      params: { id: "123" },
    };
    const next = jest.fn();

    await validate({
      body: z.object({ name: z.string() }),
      query: z.object({ limit: z.coerce.number() }),
      params: z.object({ id: z.string() }),
    })(req, {}, next);

    expect(req.body).toEqual({ name: "Ada" });
    expect(req.query).toEqual({ limit: 10 });
    expect(req.params).toEqual({ id: "123" });
    expect(next).toHaveBeenCalledWith();
  });

  it("converts zod errors into AppError validation errors", async () => {
    const next = jest.fn();

    await validate({
      body: z.object({ name: z.string().min(3) }),
    })({ body: { name: "Al" } }, {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: [expect.objectContaining({ field: "name" })],
    });
  });

  it("passes non-zod parser errors through", async () => {
    const next = jest.fn();
    const error = new Error("parser failed");

    await validate({
      body: { parseAsync: jest.fn().mockRejectedValue(error) },
    })({ body: {} }, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("validateFile", () => {
  it("requires a file", () => {
    const next = jest.fn();

    validateFile(z.object({}))({}, {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 400,
      message: "Archivo requerido",
    });
  });

  it("rejects invalid files and accepts valid files", () => {
    const nextInvalid = jest.fn();
    const nextValid = jest.fn();
    const schema = z.object({ mimetype: z.literal("application/pdf") });

    validateFile(schema)({ file: { mimetype: "image/png" } }, {}, nextInvalid);
    validateFile(schema)({ file: { mimetype: "application/pdf" } }, {}, nextValid);

    expect(nextInvalid.mock.calls[0][0]).toMatchObject({ statusCode: 400 });
    expect(nextValid).toHaveBeenCalledWith();
  });
});
