import express from "express";
import request from "supertest";
import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";

const mockDeliveryNote = {
  schema: {
    paths: {
      _id: { instance: "ObjectId" },
      user: { instance: "ObjectId" },
      company: { instance: "ObjectId" },
      client: { instance: "ObjectId" },
      project: { instance: "ObjectId" },
      format: { instance: "String", enumValues: ["material", "hours"] },
      description: { instance: "String" },
      workDate: { instance: "Date" },
      signed: { instance: "Boolean" },
      signedAt: { instance: "Date" },
      signatureUrl: { instance: "String" },
      pdfUrl: { instance: "String" },
      createdAt: { instance: "Date" },
      updatedAt: { instance: "Date" },
      __v: { instance: "Number" },
    },
  },
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  countDocuments: jest.fn(),
  softDeleteById: jest.fn(),
  hardDelete: jest.fn(),
};

const mockProject = {
  schema: { paths: {} },
  findOne: jest.fn(),
};

const mockUser = {
  schema: { paths: {} },
  findById: jest.fn(),
};

const mockClient = {
  schema: { paths: {} },
};

const mockCompany = {
  schema: { paths: {} },
};

const mockVerifyAccessToken = jest.fn();
const mockGeneratePdfBuffer = jest.fn();
const mockDownloadPdf = jest.fn();
const mockCloudinaryService = {
  uploadImage: jest.fn(),
  uploadPdf: jest.fn(),
};

jest.unstable_mockModule("../../models/deliveryNote.models.js", () => ({
  default: mockDeliveryNote,
}));

jest.unstable_mockModule("../../models/project.models.js", () => ({
  default: mockProject,
}));

jest.unstable_mockModule("../../models/user.models.js", () => ({
  default: mockUser,
}));

jest.unstable_mockModule("../../models/client.models.js", () => ({
  default: mockClient,
}));

jest.unstable_mockModule("../../models/company.models.js", () => ({
  default: mockCompany,
}));

jest.unstable_mockModule("../../utils/handleJWT.js", () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

jest.unstable_mockModule("../../utils/handlePDF.js", () => ({
  generatePdfBuffer: mockGeneratePdfBuffer,
  downloadPdf: mockDownloadPdf,
}));

jest.unstable_mockModule("../../services/cloudinary.service.js", () => ({
  default: mockCloudinaryService,
}));

const { default: deliveryNoteRoutes } = await import(
  "../../routes/deliverynote.routes.js"
);
const { errorHandler, notFound } = await import(
  "../../middleware/error-handler.middleware.js"
);

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/deliverynote", deliveryNoteRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
};

const app = buildApp();
const authUser = {
  _id: "507f1f77bcf86cd799439011",
  email: "admin@example.com",
  role: "admin",
  status: "verified",
  company: "507f1f77bcf86cd799439012",
};
const authHeader = { Authorization: "Bearer access-token" };
const clientId = "507f1f77bcf86cd799439013";
const projectId = "507f1f77bcf86cd799439014";
const deliveryNoteId = "507f1f77bcf86cd799439015";

const materialPayload = {
  client: clientId,
  project: projectId,
  format: "material",
  description: "Material delivery",
  workDate: "2026-01-15",
  material: {
    unit: "kg",
    data: [{ name: "Cement", quantity: 12 }],
  },
};

const mockFindChain = (data) => {
  const chain = {
    populate: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue(data),
  };
  return chain;
};

describe("Delivery Note Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockVerifyAccessToken.mockReturnValue({ _id: authUser._id });
    mockUser.findById.mockResolvedValue(authUser);
    mockGeneratePdfBuffer.mockResolvedValue(Buffer.from("pdf-buffer"));
    mockDownloadPdf.mockReturnValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("POST /api/deliverynote", () => {
    it("creates a material delivery note for an existing project/client pair", async () => {
      const createdNote = {
        _id: deliveryNoteId,
        user: authUser._id,
        company: authUser.company,
        ...materialPayload,
        workDate: "2026-01-15T00:00:00.000Z",
      };
      mockProject.findOne.mockResolvedValue({ _id: projectId, client: clientId });
      mockDeliveryNote.create.mockResolvedValue(createdNote);

      const res = await request(app)
        .post("/api/deliverynote")
        .set(authHeader)
        .send(materialPayload);

      expect(res.status).toBe(201);
      expect(mockProject.findOne).toHaveBeenCalledWith({
        _id: projectId,
        client: clientId,
        company: authUser.company,
      });
      expect(mockDeliveryNote.create).toHaveBeenCalledWith(expect.objectContaining({
        user: authUser._id,
        company: authUser.company,
        client: clientId,
        project: projectId,
        format: "material",
        description: "Material delivery",
        material: materialPayload.material,
        workDate: expect.any(Date),
      }));
      expect(res.body).toEqual(createdNote);
    });

    it("creates an hours delivery note", async () => {
      const hoursPayload = {
        client: clientId,
        project: projectId,
        format: "hours",
        workers: {
          hours: 8,
          data: [{ name: "Worker One", hours: 8 }],
        },
      };
      mockProject.findOne.mockResolvedValue({ _id: projectId, client: clientId });
      mockDeliveryNote.create.mockResolvedValue({
        _id: deliveryNoteId,
        ...hoursPayload,
      });

      const res = await request(app)
        .post("/api/deliverynote")
        .set(authHeader)
        .send(hoursPayload);

      expect(res.status).toBe(201);
      expect(mockDeliveryNote.create).toHaveBeenCalledWith(
        expect.objectContaining({
          format: "hours",
          workers: hoursPayload.workers,
        }),
      );
    });

    it("does not create delivery notes for projects outside the authenticated company", async () => {
      mockProject.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/deliverynote")
        .set(authHeader)
        .send(materialPayload);

      expect(res.status).toBe(404);
      expect(mockProject.findOne).toHaveBeenCalledWith({
        _id: projectId,
        client: clientId,
        company: authUser.company,
      });
      expect(mockDeliveryNote.create).not.toHaveBeenCalled();
    });

    it("returns 404 when the project is not associated with the client", async () => {
      mockProject.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/deliverynote")
        .set(authHeader)
        .send(materialPayload);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("No se encontró el proyecto asociado no encontrado");
      expect(mockDeliveryNote.create).not.toHaveBeenCalled();
    });

    it("rejects invalid delivery note payloads before reaching the controller", async () => {
      const res = await request(app)
        .post("/api/deliverynote")
        .set(authHeader)
        .send({
          client: "bad-id",
          project: projectId,
          format: "material",
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
      expect(mockProject.findOne).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/deliverynote", () => {
    it("returns a paginated list of delivery notes", async () => {
      const notes = [{ _id: deliveryNoteId, company: authUser.company }];
      const chain = mockFindChain(notes);
      mockDeliveryNote.find.mockReturnValue(chain);
      mockDeliveryNote.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/deliverynote")
        .set(authHeader)
        .query({ page: "1", limit: "10", sort: "-createdAt" });

      expect(res.status).toBe(200);
      expect(mockDeliveryNote.find).toHaveBeenCalledWith({
        company: authUser.company,
      });
      expect(mockDeliveryNote.countDocuments).toHaveBeenCalledWith({
        company: authUser.company,
      });
      expect(chain.populate).toHaveBeenCalledWith("company", "description");
      expect(chain.populate).toHaveBeenCalledWith("user", "description");
      expect(chain.populate).toHaveBeenCalledWith("client", "description");
      expect(chain.populate).toHaveBeenCalledWith("project", "description");
      expect(chain.skip).toHaveBeenCalledWith(0);
      expect(chain.limit).toHaveBeenCalledWith(10);
      expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.body).toEqual({
        data: notes,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    });

    it("uses filters, date range and company scope for delivery note pagination totals", async () => {
      const notes = [{ _id: deliveryNoteId, company: authUser.company }];
      const chain = mockFindChain(notes);
      mockDeliveryNote.find.mockReturnValue(chain);
      mockDeliveryNote.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/deliverynote")
        .set(authHeader)
        .query({
          page: "1",
          limit: "10",
          format: "material",
          from: "2026-01-01",
          to: "2026-01-31",
        });

      expect(res.status).toBe(200);
      expect(mockDeliveryNote.find).toHaveBeenCalledWith({
        format: "material",
        workDate: {
          $gte: new Date("2026-01-01"),
          $lte: new Date("2026-01-31"),
        },
        company: authUser.company,
      });
      expect(mockDeliveryNote.countDocuments).toHaveBeenCalledWith({
        format: "material",
        workDate: {
          $gte: new Date("2026-01-01"),
          $lte: new Date("2026-01-31"),
        },
        company: authUser.company,
      });
    });

    it("rejects invalid filters", async () => {
      const res = await request(app)
        .get("/api/deliverynote")
        .set(authHeader)
        .query({ unknown: "value" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
      expect(mockDeliveryNote.find).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/deliverynote/:id", () => {
    it("returns a delivery note by id within the authenticated company", async () => {
      const note = {
        _id: deliveryNoteId,
        company: authUser.company,
        format: "material",
      };
      mockDeliveryNote.findOne.mockResolvedValue(note);

      const res = await request(app)
        .get(`/api/deliverynote/${deliveryNoteId}`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(mockDeliveryNote.findOne).toHaveBeenCalledWith({
        _id: deliveryNoteId,
        company: authUser.company,
      });
      expect(res.body).toEqual(note);
    });

    it("returns 404 when the delivery note is not found", async () => {
      mockDeliveryNote.findOne.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/deliverynote/${deliveryNoteId}`)
        .set(authHeader);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("No se encontró el albaran no encontrado");
    });
  });

  describe("GET /api/deliverynote/pdf/:id", () => {
    it("generates a PDF for an unsigned delivery note", async () => {
      const note = {
        _id: deliveryNoteId,
        name: "delivery-note",
        signed: false,
        company: authUser.company,
      };
      mockDeliveryNote.findOne.mockResolvedValue(note);

      const res = await request(app)
        .get(`/api/deliverynote/pdf/${deliveryNoteId}`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("application/pdf");
      expect(mockGeneratePdfBuffer).toHaveBeenCalledWith(note);
      expect(res.body).toEqual(Buffer.from("pdf-buffer"));
    });
  });

  describe("PATCH /api/deliverynote/:id/sign", () => {
    it("signs a delivery note and uploads its signature and PDF", async () => {
      const note = {
        _id: deliveryNoteId,
        company: authUser.company,
        signed: false,
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockDeliveryNote.findOne.mockResolvedValue(note);
      mockCloudinaryService.uploadImage.mockResolvedValue({
        secure_url: "https://cdn.example/signature.png",
      });
      mockCloudinaryService.uploadPdf.mockResolvedValue({
        secure_url: "https://cdn.example/delivery-note.pdf",
      });

      const res = await request(app)
        .patch(`/api/deliverynote/${deliveryNoteId}/sign`)
        .set(authHeader)
        .attach("signature", Buffer.from("signature-buffer"), {
          filename: "signature.png",
          contentType: "image/png",
        });

      expect(res.status).toBe(200);
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(
        Buffer.from("signature-buffer"),
      );
      expect(mockGeneratePdfBuffer).toHaveBeenCalledWith(
        expect.objectContaining({
          signatureUrl: "https://cdn.example/signature.png",
          signed: true,
        }),
      );
      expect(mockCloudinaryService.uploadPdf).toHaveBeenCalledWith(
        Buffer.from("pdf-buffer"),
      );
      expect(note.save).toHaveBeenCalled();
      expect(res.body).toEqual(
        expect.objectContaining({
          signatureUrl: "https://cdn.example/signature.png",
          signed: true,
          pdfUrl: "https://cdn.example/delivery-note.pdf",
        }),
      );
    });

    it("rejects signing a delivery note without a signature file", async () => {
      const res = await request(app)
        .patch(`/api/deliverynote/${deliveryNoteId}/sign`)
        .set(authHeader);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Archivo de firma requerido");
      expect(mockDeliveryNote.findOne).not.toHaveBeenCalled();
      expect(mockCloudinaryService.uploadImage).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/deliverynote/:id", () => {
    it("blocks deletion of signed delivery notes", async () => {
      mockDeliveryNote.findOne.mockResolvedValue({
        _id: deliveryNoteId,
        signed: true,
      });

      const res = await request(app)
        .delete(`/api/deliverynote/${deliveryNoteId}`)
        .set(authHeader);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("No se puede eliminar un albaran firmado");
    });

    it("calls soft delete for unsigned notes when requested", async () => {
      const note = {
        _id: deliveryNoteId,
        signed: false,
      };
      mockDeliveryNote.findOne.mockResolvedValue(note);
      mockDeliveryNote.softDeleteById.mockResolvedValue(undefined);

      const res = await request(app)
        .delete(`/api/deliverynote/${deliveryNoteId}`)
        .set(authHeader)
        .query({ soft: "true" });

      expect(mockDeliveryNote.softDeleteById).toHaveBeenCalledWith(deliveryNoteId);
      expect(mockDeliveryNote.hardDelete).not.toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body).toEqual(note);
    });

    it("blocks non-admin users before deleting", async () => {
      mockUser.findById.mockResolvedValue({
        ...authUser,
        role: "guest",
      });

      const res = await request(app)
        .delete(`/api/deliverynote/${deliveryNoteId}`)
        .set(authHeader);

      expect(res.status).toBe(403);
      expect(mockDeliveryNote.findOne).not.toHaveBeenCalled();
    });
  });

  describe("Authentication middleware", () => {
    it("rejects requests without an access token", async () => {
      const res = await request(app).get("/api/deliverynote");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("No se proporcionó token");
      expect(mockDeliveryNote.find).not.toHaveBeenCalled();
    });
  });
});
