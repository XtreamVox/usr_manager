import { describe, expect, it } from "@jest/globals";
import { z } from "zod";
import {
  buildPaginationAndFilterScheme,
  getSchemaMap,
} from "../../squemes/mongoToZod.squemes.js";

describe("mongoToZod schemes", () => {
  it("builds schema maps for supported models and ignores unsupported models", () => {
    for (const model of ["client", "user", "company", "project", "deliveryNote"]) {
      const schemaMap = getSchemaMap(model);
      expect(schemaMap).toEqual(expect.any(Object));
      expect(schemaMap).not.toHaveProperty("__v");
      expect(schemaMap).not.toHaveProperty("company");
    }

    expect(getSchemaMap("unknown")).toBeUndefined();
  });

  it("parses pagination, ascending sort, descending sort, dates and typed filters", () => {
    const schema = buildPaginationAndFilterScheme({
      name: z.string(),
      active: z.coerce.boolean(),
      hours: z.coerce.number(),
    });

    expect(schema.parse({
      limit: "20",
      page: "2",
      sort: "name",
      from: "2026-01-01",
      to: "2026-02-01",
      name: "Ada",
      active: "true",
      hours: "8",
    })).toEqual({
      limit: 20,
      page: 2,
      sort: { name: 1 },
      from: new Date("2026-01-01"),
      to: new Date("2026-02-01"),
      filters: { name: "Ada", active: true, hours: 8 },
    });

    expect(schema.parse({ sort: "-name" }).sort).toEqual({ name: -1 });
  });

  it("reports invalid pagination, sort, dates, filter names and filter values", () => {
    const schema = buildPaginationAndFilterScheme({
      name: z.string().min(2),
      age: z.coerce.number(),
    });

    const result = schema.safeParse({
      limit: "0",
      page: "0",
      sort: "-missing",
      from: "not-a-date",
      unknown: "value",
      name: "",
    });

    expect(result.success).toBe(false);
    expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(
      expect.arrayContaining(["limit", "page", "sort", "from", "unknown", "name"]),
    );
  });

  it("uses defaults when no query values are supplied", () => {
    const schema = buildPaginationAndFilterScheme({ name: z.string() });

    expect(schema.parse({})).toEqual({
      limit: 10,
      page: 1,
      sort: { createdAt: -1 },
      filters: {},
    });
  });
});
