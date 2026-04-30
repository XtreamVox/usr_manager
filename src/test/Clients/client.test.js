import express from "express";
import request from "supertest";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

const mockClient = {
  schema: {
    paths: {
      _id: { instance: "ObjectId" },
      user: { instance: "ObjectId" },
      company: { instance: "ObjectId" },
      name: { instance: "String" },
      cif: { instance: "String" },
      email: { instance: "String" },
      phone: { instance: "String" },
      "address.street": { instance: "String" },
      "address.number": { instance: "String" },
      "address.postal": { instance: "String" },
      "address.city": { instance: "String" },
      "address.province": { instance: "String" },
      createdAt: { instance: "Date" },
      updatedAt: { instance: "Date" },
      __v: { instance: "Number" },
    },
  },
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  countDocuments: jest.fn(),
  softDeleteById: jest.fn(),
  hardDelete: jest.fn(),
  findDeleted: jest.fn(),
  restoreById: jest.fn(),
};

const mockUser = {
  findById: jest.fn(),
};

const mockCompany = {
  schema: { paths: {} },
};

const mockProject = {
  schema: { paths: {} },
};

const mockDeliveryNote = {
  schema: { paths: {} },
};

const mockVerifyAccessToken = jest.fn();

jest.unstable_mockModule("../../models/client.models.js", () => ({
  default: mockClient,
}));

jest.unstable_mockModule("../../models/user.models.js", () => ({
  default: mockUser,
}));

jest.unstable_mockModule("../../models/company.models.js", () => ({
  default: mockCompany,
}));

jest.unstable_mockModule("../../models/project.models.js", () => ({
  default: mockProject,
}));

jest.unstable_mockModule("../../models/deliveryNote.models.js", () => ({
  default: mockDeliveryNote,
}));

jest.unstable_mockModule("../../utils/handleJWT.js", () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

const { default: clientRoutes } = await import("../../routes/client.routes.js");
const { errorHandler, notFound } = await import(
  "../../middleware/error-handler.middleware.js"
);

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/client", clientRoutes);
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

const validClientPayload = {
  name: "Acme Client",
  cif: "B12345678",
  email: "client@example.com",
  phone: "600123123",
  address: {
    street: "Main",
    number: "12",
    postal: "28001",
    city: "Madrid",
    province: "Madrid",
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

describe("Client Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    mockVerifyAccessToken.mockReturnValue({ _id: authUser._id });
    mockUser.findById.mockResolvedValue(authUser);
  });

  describe("POST /api/client", () => {
    it("creates a client for the authenticated user's company", async () => {
      const createdClient = {
        _id: clientId,
        user: authUser._id,
        company: authUser.company,
        ...validClientPayload,
      };
      mockClient.findOne.mockResolvedValue(null);
      mockClient.create.mockResolvedValue(createdClient);

      const res = await request(app)
        .post("/api/client")
        .set(authHeader)
        .send(validClientPayload);

      expect(res.status).toBe(201);
      expect(mockClient.findOne).toHaveBeenCalledWith({
        company: authUser.company,
        cif: "B12345678",
      });
      expect(mockClient.create).toHaveBeenCalledWith({
        user: authUser._id,
        company: authUser.company,
        name: "Acme Client",
        cif: "B12345678",
        email: "client@example.com",
        phone: "600123123",
        address: validClientPayload.address,
      });
      expect(res.body).toEqual(createdClient);
    });

    it("rejects duplicated clients in the same company", async () => {
      mockClient.findOne.mockResolvedValue({ _id: clientId });

      const res = await request(app)
        .post("/api/client")
        .set(authHeader)
        .send(validClientPayload);

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Ya existe el cliente asociado a esta company");
      expect(mockClient.create).not.toHaveBeenCalled();
    });

    it("rejects invalid client payloads before reaching the controller", async () => {
      const res = await request(app)
        .post("/api/client")
        .set(authHeader)
        .send({
          name: "A",
          cif: "bad-cif",
          email: "not-email",
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
      expect(mockClient.create).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/client", () => {
    it("returns a paginated list of clients", async () => {
      const clients = [
        {
          _id: clientId,
          name: "Acme Client",
          company: authUser.company,
        },
      ];
      const chain = mockFindChain(clients);
      mockClient.find.mockReturnValue(chain);
      mockClient.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/client")
        .set(authHeader)
        .query({ page: "1", limit: "10", sort: "-createdAt" });

      expect(res.status).toBe(200);
      expect(mockClient.find).toHaveBeenCalledWith({ company: authUser.company });
      expect(mockClient.countDocuments).toHaveBeenCalledWith({
        company: authUser.company,
      });
      expect(chain.populate).toHaveBeenCalledWith("company", "name");
      expect(chain.populate).toHaveBeenCalledWith("user", "name");
      expect(chain.skip).toHaveBeenCalledWith(0);
      expect(chain.limit).toHaveBeenCalledWith(10);
      expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.body).toEqual({
        data: clients,
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

    it("uses the authenticated company and filters for pagination totals", async () => {
      const clients = [{ _id: clientId, name: "Acme Client" }];
      const chain = mockFindChain(clients);
      mockClient.find.mockReturnValue(chain);
      mockClient.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/client")
        .set(authHeader)
        .query({ page: "1", limit: "10", name: "Acme Client" });

      expect(res.status).toBe(200);
      expect(mockClient.find).toHaveBeenCalledWith({
        name: "Acme Client",
        company: authUser.company,
      });
      expect(mockClient.countDocuments).toHaveBeenCalledWith({
        name: "Acme Client",
        company: authUser.company,
      });
    });

    it("rejects invalid filters", async () => {
      const res = await request(app)
        .get("/api/client")
        .set(authHeader)
        .query({ unknown: "value" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
      expect(mockClient.find).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/client/:id", () => {
    it("returns a client by id within the authenticated company", async () => {
      const client = {
        _id: clientId,
        name: "Acme Client",
        company: authUser.company,
      };
      mockClient.findOne.mockResolvedValue(client);

      const res = await request(app).get(`/api/client/${clientId}`).set(authHeader);

      expect(res.status).toBe(200);
      expect(mockClient.findOne).toHaveBeenCalledWith({
        _id: clientId,
        company: authUser.company,
      });
      expect(res.body).toEqual(client);
    });

    it("returns 404 when the client does not exist in the company", async () => {
      mockClient.findOne.mockResolvedValue(null);

      const res = await request(app).get(`/api/client/${clientId}`).set(authHeader);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Cliente no encontrado no encontrado");
    });
  });

  describe("PUT /api/client/:id", () => {
    it("updates client data", async () => {
      const updatePayload = {
        name: "Updated Client",
        cif: "B87654321",
        email: "updated@example.com",
      };
      const client = {
        _id: clientId,
        ...updatePayload,
        updateOne: jest.fn().mockResolvedValue(undefined),
      };
      mockClient.findOne.mockResolvedValue(client);

      const res = await request(app)
        .put(`/api/client/${clientId}`)
        .set(authHeader)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(mockClient.findOne).toHaveBeenCalledWith({
        _id: clientId,
        company: authUser.company,
      });
      expect(client.updateOne).toHaveBeenCalledWith(updatePayload, {
        new: true,
        runValidators: true,
      });
      expect(res.body).toEqual(updatePayload);
    });

    it("rejects invalid client ids", async () => {
      const res = await request(app)
        .put("/api/client/not-a-mongo-id")
        .set(authHeader)
        .send({ name: "Updated Client" });

      expect(res.status).toBe(400);
      expect(mockClient.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/client/:id", () => {
    it("soft deletes a client when requested", async () => {
      mockClient.findOne.mockReturnValue({
        _id: clientId,
        name: "Acme Client",
      });
      mockClient.softDeleteById.mockResolvedValue({});

      const res = await request(app)
        .delete(`/api/client/${clientId}`)
        .set(authHeader)
        .query({ soft: "true" });

      expect(res.status).toBe(200);
      expect(mockClient.findOne).toHaveBeenCalledWith({
        _id: clientId,
        company: authUser.company,
      });
      expect(mockClient.softDeleteById).toHaveBeenCalledWith(clientId);
      expect(mockClient.hardDelete).not.toHaveBeenCalled();
      expect(res.body).toEqual({
        success: true,
        clientName: "Acme Client",
      });
    });

    it("hard deletes a client by default", async () => {
      mockClient.findOne.mockReturnValue({
        _id: clientId,
        name: "Acme Client",
      });
      mockClient.hardDelete.mockResolvedValue({});

      const res = await request(app).delete(`/api/client/${clientId}`).set(authHeader);

      expect(res.status).toBe(200);
      expect(mockClient.hardDelete).toHaveBeenCalledWith(clientId);
      expect(mockClient.softDeleteById).not.toHaveBeenCalled();
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/client/archived", () => {
    it("lists archived clients for an admin", async () => {
      const archivedClients = [{ _id: clientId, name: "Archived Client" }];
      mockClient.findDeleted.mockResolvedValue(archivedClients);

      const res = await request(app).get("/api/client/archived").set(authHeader);

      expect(res.status).toBe(200);
      expect(mockClient.findDeleted).toHaveBeenCalledWith({
        company: authUser.company,
      });
      expect(res.body).toEqual(archivedClients);
    });

    it("blocks non-admin users from listing archived clients", async () => {
      mockUser.findById.mockResolvedValue({
        ...authUser,
        role: "guest",
      });

      const res = await request(app).get("/api/client/archived").set(authHeader);

      expect(res.status).toBe(403);
      expect(mockClient.findDeleted).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/client/:id/restore", () => {
    it("restores an archived client for an admin", async () => {
      mockClient.findDeleted.mockResolvedValue([{ _id: clientId }]);
      mockClient.restoreById.mockReturnValue({ _id: clientId });

      const res = await request(app)
        .patch(`/api/client/${clientId}/restore`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(mockClient.findDeleted).toHaveBeenCalledWith({
        _id: clientId,
        company: authUser.company,
      });
      expect(mockClient.restoreById).toHaveBeenCalledWith(clientId);
      expect(res.body).toEqual({ success: true });
    });
  });

  describe("Authentication middleware", () => {
    it("rejects requests without an access token", async () => {
      const res = await request(app).get("/api/client");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("No se proporcionó token");
      expect(mockClient.find).not.toHaveBeenCalled();
    });
  });
});
