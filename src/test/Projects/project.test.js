import express from "express";
import request from "supertest";
import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";

const mockProject = {
  schema: {
    paths: {
      _id: { instance: "ObjectId" },
      user: { instance: "ObjectId" },
      company: { instance: "ObjectId" },
      client: { instance: "ObjectId" },
      name: { instance: "String" },
      projectCode: { instance: "String" },
      "address.street": { instance: "String" },
      "address.number": { instance: "String" },
      "address.postal": { instance: "String" },
      "address.city": { instance: "String" },
      "address.province": { instance: "String" },
      email: { instance: "String" },
      notes: { instance: "String" },
      active: { instance: "Boolean" },
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
  findDeleted: jest.fn(),
  restoreById: jest.fn(),
};

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
      createdAt: { instance: "Date" },
      updatedAt: { instance: "Date" },
      __v: { instance: "Number" },
    },
  },
  findOne: jest.fn(),
};

const mockUser = {
  schema: { paths: {} },
  findById: jest.fn(),
  findOne: jest.fn(),
};

const mockCompany = {
  schema: { paths: {} },
};

const mockDeliveryNote = {
  schema: { paths: {} },
};

const mockVerifyAccessToken = jest.fn();

jest.unstable_mockModule("../../models/project.models.js", () => ({
  default: mockProject,
}));

jest.unstable_mockModule("../../models/client.models.js", () => ({
  default: mockClient,
}));

jest.unstable_mockModule("../../models/user.models.js", () => ({
  default: mockUser,
}));

jest.unstable_mockModule("../../models/company.models.js", () => ({
  default: mockCompany,
}));

jest.unstable_mockModule("../../models/deliveryNote.models.js", () => ({
  default: mockDeliveryNote,
}));

jest.unstable_mockModule("../../utils/handleJWT.js", () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

const { default: projectRoutes } = await import("../../routes/project.routes.js");
const { errorHandler, notFound } = await import(
  "../../middleware/error-handler.middleware.js"
);

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/project", projectRoutes);
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
const reassignedUserId = "507f1f77bcf86cd799439015";

const validProjectPayload = {
  client: clientId,
  name: "Project Alpha",
  email: "project@example.com",
  address: {
    street: "Main",
    number: "12",
    postal: "28001",
    city: "Madrid",
    province: "Madrid",
  },
  notes: "Important project",
  active: true,
};

const mockFindChain = (data) => ({
  populate: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue(data),
});

describe("Project Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockVerifyAccessToken.mockReturnValue({ _id: authUser._id });
    mockUser.findById.mockResolvedValue(authUser);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("POST /api/project", () => {
    it("creates a project for a client in the authenticated company", async () => {
      const createdProject = {
        _id: projectId,
        user: authUser,
        company: authUser.company,
        ...validProjectPayload,
      };
      mockClient.findOne.mockResolvedValue({ _id: clientId, company: authUser.company });
      mockProject.create.mockResolvedValue(createdProject);

      const res = await request(app)
        .post("/api/project")
        .set(authHeader)
        .send(validProjectPayload);

      expect(res.status).toBe(201);
      expect(mockClient.findOne).toHaveBeenCalledWith({
        _id: clientId,
        company: authUser.company,
      });
      expect(mockProject.create).toHaveBeenCalledWith({
        user: authUser,
        company: authUser.company,
        ...validProjectPayload,
      });
      expect(res.body).toEqual(createdProject);
    });

    it("returns 404 when the client does not belong to the company", async () => {
      mockClient.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/project")
        .set(authHeader)
        .send(validProjectPayload);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("No se encontró el cliente no encontrado");
      expect(mockProject.create).not.toHaveBeenCalled();
    });

    it("rejects invalid project payloads before reaching the controller", async () => {
      const res = await request(app)
        .post("/api/project")
        .set(authHeader)
        .send({
          client: "bad-id",
          name: "A",
          email: "not-email",
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
      expect(mockClient.findOne).not.toHaveBeenCalled();
      expect(mockProject.create).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/project", () => {
    it("returns a paginated list of projects", async () => {
      const projects = [{ _id: projectId, name: "Project Alpha" }];
      const chain = mockFindChain(projects);
      mockProject.find.mockReturnValue(chain);
      mockProject.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/project")
        .set(authHeader)
        .query({ page: "1", limit: "10", sort: "-createdAt" });

      expect(res.status).toBe(200);
      expect(mockProject.find).toHaveBeenCalledWith({
        company: authUser.company,
      });
      expect(mockProject.countDocuments).toHaveBeenCalledWith({
        company: authUser.company,
      });
      expect(chain.populate).toHaveBeenCalledWith("company", "name");
      expect(chain.populate).toHaveBeenCalledWith("user", "name");
      expect(chain.populate).toHaveBeenCalledWith("client", "name");
      expect(chain.skip).toHaveBeenCalledWith(0);
      expect(chain.limit).toHaveBeenCalledWith(10);
      expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.body).toEqual({
        data: projects,
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

    it("uses filters and company scope for project pagination totals", async () => {
      const projects = [{ _id: projectId, name: "Project Alpha" }];
      const chain = mockFindChain(projects);
      mockProject.find.mockReturnValue(chain);
      mockProject.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/project")
        .set(authHeader)
        .query({ page: "1", limit: "10", active: "true" });

      expect(res.status).toBe(200);
      expect(mockProject.find).toHaveBeenCalledWith({
        active: true,
        company: authUser.company,
      });
      expect(mockProject.countDocuments).toHaveBeenCalledWith({
        active: true,
        company: authUser.company,
      });
    });

    it("rejects invalid filters", async () => {
      const res = await request(app)
        .get("/api/project")
        .set(authHeader)
        .query({ unknown: "value" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
      expect(mockProject.find).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/project/:id", () => {
    it("returns a project by id within the authenticated company", async () => {
      const project = { _id: projectId, company: authUser.company, name: "Project Alpha" };
      mockProject.findOne.mockResolvedValue(project);

      const res = await request(app)
        .get(`/api/project/${projectId}`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(mockProject.findOne).toHaveBeenCalledWith({
        _id: projectId,
        company: authUser.company,
      });
      expect(res.body).toEqual(project);
    });

    it("returns 404 when the project is not found", async () => {
      mockProject.findOne.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/project/${projectId}`)
        .set(authHeader);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Projecto no encontrado no encontrado");
    });
  });

  describe("PUT /api/project/:id", () => {
    it("updates a project", async () => {
      const project = {
        _id: projectId,
        company: authUser.company,
        updateOne: jest.fn().mockResolvedValue(undefined),
      };
      mockProject.findOne.mockResolvedValue(project);

      const res = await request(app)
        .put(`/api/project/${projectId}`)
        .set(authHeader)
        .send({ name: "Updated Project", active: false });

      expect(res.status).toBe(200);
      expect(mockProject.findOne).toHaveBeenCalledWith({
        _id: projectId,
        company: authUser.company,
      });
      expect(project.updateOne).toHaveBeenCalledWith(
        { name: "Updated Project", active: false },
        { new: true },
      );
      expect(res.body).toEqual({ _id: projectId, company: authUser.company });
    });

    it("allows admins to reassign a project", async () => {
      const project = {
        _id: projectId,
        company: authUser.company,
        updateOne: jest.fn().mockResolvedValue(undefined),
      };
      mockProject.findOne.mockResolvedValue(project);
      mockUser.findOne.mockResolvedValue({ _id: reassignedUserId });

      const res = await request(app)
        .put(`/api/project/${projectId}`)
        .set(authHeader)
        .send({ user: reassignedUserId });

      expect(res.status).toBe(200);
      expect(mockUser.findOne).toHaveBeenCalledWith({
        _id: reassignedUserId,
        company: authUser.company,
      });
      expect(project.updateOne).toHaveBeenCalledWith(
        { user: reassignedUserId },
        { new: true },
      );
    });

    it("blocks guests from reassigning a project", async () => {
      mockUser.findById.mockResolvedValue({ ...authUser, role: "guest" });
      mockProject.findOne.mockResolvedValue({
        _id: projectId,
        updateOne: jest.fn(),
      });

      const res = await request(app)
        .put(`/api/project/${projectId}`)
        .set(authHeader)
        .send({ user: reassignedUserId });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Un guest no puede reasignar un proyecto");
    });
  });

  describe("GET /api/project/archived", () => {
    it("lists archived projects for admins", async () => {
      const archivedProjects = [{ _id: projectId, deleted: true }];
      mockProject.findDeleted.mockResolvedValue(archivedProjects);

      const res = await request(app)
        .get("/api/project/archived")
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(mockProject.findDeleted).toHaveBeenCalledWith({
        company: authUser.company,
      });
      expect(res.body).toEqual(archivedProjects);
    });

    it("blocks non-admin users from archived projects", async () => {
      mockUser.findById.mockResolvedValue({ ...authUser, role: "guest" });

      const res = await request(app)
        .get("/api/project/archived")
        .set(authHeader);

      expect(res.status).toBe(403);
      expect(mockProject.findDeleted).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/project/:id", () => {
    it("soft deletes a project when requested", async () => {
      const project = { _id: projectId, company: authUser.company };
      mockProject.findOne.mockResolvedValue(project);
      mockProject.softDeleteById.mockResolvedValue(undefined);

      const res = await request(app)
        .delete(`/api/project/${projectId}`)
        .set(authHeader)
        .query({ soft: "true" });

      expect(res.status).toBe(200);
      expect(mockProject.softDeleteById).toHaveBeenCalledWith(projectId);
      expect(mockProject.hardDelete).not.toHaveBeenCalled();
      expect(res.body).toEqual(project);
    });

    it("hard deletes a project by default", async () => {
      const project = { _id: projectId, company: authUser.company };
      mockProject.findOne.mockResolvedValue(project);
      mockProject.hardDelete.mockResolvedValue(undefined);

      const res = await request(app)
        .delete(`/api/project/${projectId}`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(mockProject.hardDelete).toHaveBeenCalledWith(projectId);
      expect(mockProject.softDeleteById).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/project/:id/restore", () => {
    it("restores an archived project for admins", async () => {
      const restoredProject = { _id: projectId, deleted: false };
      mockProject.findDeleted.mockResolvedValue([{ _id: projectId }]);
      mockProject.restoreById.mockResolvedValue(restoredProject);

      const res = await request(app)
        .patch(`/api/project/${projectId}/restore`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(mockProject.findDeleted).toHaveBeenCalledWith({
        _id: projectId,
        company: authUser.company,
      });
      expect(mockProject.restoreById).toHaveBeenCalledWith(projectId);
      expect(res.body).toEqual(restoredProject);
    });
  });

  describe("Authentication middleware", () => {
    it("rejects requests without an access token", async () => {
      const res = await request(app).get("/api/project");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("No se proporcionó token");
      expect(mockProject.find).not.toHaveBeenCalled();
    });
  });
});
