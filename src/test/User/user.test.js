import express from "express";
import request from "supertest";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

const mockUser = {
  create: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  softDeleteById: jest.fn(),
  hardDelete: jest.fn(),
  deleteMany: jest.fn(),
};

const mockCompany = {
  create: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  deleteMany: jest.fn(),
};

const mockStorage = {
  create: jest.fn(),
  deleteMany: jest.fn(),
};

const mockRefreshToken = {
  create: jest.fn(),
  findOne: jest.fn(),
  updateMany: jest.fn(),
  deleteMany: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

const mockEncrypt = jest.fn();
const mockCompare = jest.fn();
const mockGenerateAccessToken = jest.fn();
const mockGenerateRefreshToken = jest.fn();
const mockVerifyAccessToken = jest.fn();
const mockRefreshTokens = jest.fn();
const mockSendSlackNotification = jest.fn();

jest.unstable_mockModule("../../models/user.models.js", () => ({
  default: mockUser,
}));

jest.unstable_mockModule("../../models/company.models.js", () => ({
  default: mockCompany,
}));

jest.unstable_mockModule("../../models/storage.models.js", () => ({
  default: mockStorage,
}));

jest.unstable_mockModule("../../models/refreshToken.models.js", () => ({
  default: mockRefreshToken,
}));

jest.unstable_mockModule("../../utils/handlePassword.js", () => ({
  compare: mockCompare,
  encrypt: mockEncrypt,
}));

jest.unstable_mockModule("../../utils/handleJWT.js", () => ({
  generateAccessToken: mockGenerateAccessToken,
  generateRefreshToken: mockGenerateRefreshToken,
  verifyAccessToken: mockVerifyAccessToken,
  refreshTokens: mockRefreshTokens,
}));

jest.unstable_mockModule("../../services/event.service.js", () => ({
  default: mockEventEmitter,
  EVENTS: {
    USER_REGISTERED: "USER_REGISTERED",
    USER_VERIFIED: "USER_VERIFIED",
    USER_DELETED: "USER_DELETED",
    USER_INVITED: "USER_INVITED",
  },
}));

jest.unstable_mockModule("../../utils/handleLogger.js", () => ({
  sendSlackNotification: mockSendSlackNotification,
}));

jest.unstable_mockModule("../../utils/sendEmails.js", () => ({
  sendVerificationEmail: jest.fn(),
}));

jest.unstable_mockModule("../../controllers/cloudinary.controller.js", () => ({
  uploadAvatar: jest.fn(),
}));

const { default: userRoutes } = await import("../../routes/user.routes.js");
const { errorHandler, notFound } = await import(
  "../../middleware/error-handler.middleware.js"
);

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/user", userRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
};

const app = buildApp();
const authUser = {
  _id: "507f1f77bcf86cd799439011",
  email: "admin@example.com",
  name: "Admin",
  role: "admin",
  status: "verified",
  company: "507f1f77bcf86cd799439012",
};

const authHeader = { Authorization: "Bearer access-token" };

describe("User Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockGenerateAccessToken.mockReturnValue("access-token");
    mockGenerateRefreshToken.mockReturnValue("refresh-token");
    mockVerifyAccessToken.mockReturnValue({ _id: authUser._id });
    mockEncrypt.mockResolvedValue("hashed-password");
    mockCompare.mockResolvedValue(true);
    mockSendSlackNotification.mockResolvedValue(undefined);
  });

  describe("POST /api/user/register", () => {
    it("registers a new user and returns tokens", async () => {
      const createdUser = {
        _id: authUser._id,
        email: "test@example.com",
        name: "Test",
        role: "admin",
        status: "pending",
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockUser.create.mockResolvedValue(createdUser);
      mockRefreshToken.create.mockResolvedValue({});

      const res = await request(app).post("/api/user/register").send({
        name: "Test User",
        email: "TEST@example.com",
        password: "Password123",
      });

      expect(res.status).toBe(200);
      expect(mockEncrypt).toHaveBeenCalledWith("Password123");
      expect(mockUser.create).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "hashed-password",
      });
      expect(createdUser.save).toHaveBeenCalled();
      expect(mockRefreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          token: "refresh-token",
          user: authUser._id,
        }),
      );
      expect(res.body).toEqual({
        userData: {
          email: "test@example.com",
          status: "pending",
          role: "admin",
          id: authUser._id,
          verificationCode: expect.stringMatching(/^\d{6}$/),
        },
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
    });

    it("rejects invalid register payloads before reaching the controller", async () => {
      const res = await request(app).post("/api/user/register").send({
        name: "A",
        email: "not-email",
        password: "weak",
      });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
      expect(mockUser.create).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/user/login", () => {
    it("logs in a verified user", async () => {
      const select = jest.fn().mockResolvedValue({
        _id: authUser._id,
        email: "test@example.com",
        password: "hashed-password",
        role: "admin",
        status: "verified",
      });
      mockUser.findOne.mockReturnValue({ select });
      mockRefreshToken.create.mockResolvedValue({});

      const res = await request(app).post("/api/user/login").send({
        email: "TEST@example.com",
        password: "Password123",
      });

      expect(res.status).toBe(200);
      expect(mockUser.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(select).toHaveBeenCalledWith("+password");
      expect(mockCompare).toHaveBeenCalledWith("Password123", "hashed-password");
      expect(res.body).toEqual({
        userData: {
          email: "test@example.com",
          status: "verified",
          role: "admin",
        },
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
    });

    it("rejects pending users", async () => {
      mockUser.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "hashed-password",
          status: "pending",
        }),
      });

      const res = await request(app).post("/api/user/login").send({
        email: "test@example.com",
        password: "Password123",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Usuario pendiente de verificación");
      expect(mockCompare).not.toHaveBeenCalled();
    });
  });

  describe("PUT /api/user/validation", () => {
    it("verifies the user when the code matches", async () => {
      mockUser.findById
        .mockResolvedValueOnce(authUser)
        .mockResolvedValueOnce({
          ...authUser,
          verificationCode: "123456",
          verificationAttempts: 3,
        });
      mockUser.findByIdAndUpdate.mockResolvedValue({
        ...authUser,
        status: "verified",
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      const res = await request(app)
        .put("/api/user/validation")
        .set(authHeader)
        .send({ code: "123456" });

      expect(res.status).toBe(200);
      expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(
        authUser._id,
        { status: "verified" },
        { new: true },
      );
      expect(res.body.message).toBe("Usuario verificado");
    });

    it("decrements attempts and rejects wrong verification codes", async () => {
      const pendingUser = {
        ...authUser,
        verificationCode: "123456",
        verificationAttempts: 3,
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockUser.findById.mockResolvedValueOnce(authUser).mockResolvedValueOnce(pendingUser);

      const res = await request(app)
        .put("/api/user/validation")
        .set(authHeader)
        .send({ code: "654321" });

      expect(res.status).toBe(400);
      expect(pendingUser.verificationAttempts).toBe(2);
      expect(pendingUser.save).toHaveBeenCalled();
      expect(res.body.message).toBe("Código de verificación incorrecto");
    });
  });

  describe("GET /api/user", () => {
    it("returns the authenticated user with company populated", async () => {
      const userWithCompany = {
        ...authUser,
        company: { _id: authUser.company, name: "Acme" },
      };
      const populate = jest.fn().mockResolvedValue(userWithCompany);
      mockUser.findById.mockResolvedValueOnce(authUser).mockReturnValueOnce({ populate });

      const res = await request(app).get("/api/user").set(authHeader);

      expect(res.status).toBe(200);
      expect(populate).toHaveBeenCalledWith("company", "name");
      expect(res.body.company.name).toBe("Acme");
    });
  });

  describe("PUT /api/user/register", () => {
    it("updates user profile data", async () => {
      const updatedUser = {
        ...authUser,
        name: "Updated",
        lastName: "User",
        nif: "12345678Z",
      };
      mockUser.findById.mockResolvedValue(authUser);
      mockUser.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const res = await request(app)
        .put("/api/user/register")
        .set(authHeader)
        .send({ name: "Updated", lastName: "User", nif: "12345678z" });

      expect(res.status).toBe(200);
      expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(
        authUser._id,
        { name: "Updated", lastName: "User", nif: "12345678Z" },
        { new: true },
      );
      expect(res.body.nif).toBe("12345678Z");
    });
  });

  describe("PUT /api/user/password", () => {
    it("changes the current user password", async () => {
      const select = jest.fn().mockResolvedValue({
        ...authUser,
        password: "old-hash",
      });
      mockUser.findById.mockResolvedValueOnce(authUser).mockReturnValueOnce({ select });
      mockUser.findByIdAndUpdate.mockResolvedValue({});
      mockEncrypt.mockResolvedValue("new-hash");

      const res = await request(app)
        .put("/api/user/password")
        .set(authHeader)
        .send({
          currentPassword: "Password123",
          newPassword: "Password456",
        });

      expect(res.status).toBe(200);
      expect(select).toHaveBeenCalledWith("+password");
      expect(mockCompare).toHaveBeenCalledWith("Password123", "old-hash");
      expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(authUser._id, {
        password: "new-hash",
      });
      expect(res.body.message).toBe("Contraseña actualizada");
    });
  });

  describe("POST /api/user/refresh", () => {
    it("refreshes an active session", async () => {
      mockRefreshToken.findOne.mockResolvedValue({
        isActive: jest.fn().mockReturnValue(true),
      });
      mockRefreshTokens.mockImplementation((req, res) =>
        res.json({ accessToken: "new-access", refreshToken: "new-refresh" }),
      );

      const res = await request(app)
        .post("/api/user/refresh")
        .send({ refreshToken: "refresh-token" });

      expect(res.status).toBe(200);
      expect(mockRefreshToken.findOne).toHaveBeenCalledWith({
        token: "refresh-token",
      });
      expect(res.body).toEqual({
        accessToken: "new-access",
        refreshToken: "new-refresh",
      });
    });

    it("rejects inactive refresh tokens", async () => {
      mockRefreshToken.findOne.mockResolvedValue({
        isActive: jest.fn().mockReturnValue(false),
      });

      const res = await request(app)
        .post("/api/user/refresh")
        .send({ refreshToken: "refresh-token" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Token no válido");
      expect(mockRefreshTokens).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/user/logout", () => {
    it("revokes all active sessions for the current user", async () => {
      mockUser.findById.mockResolvedValue(authUser);
      mockRefreshToken.updateMany.mockResolvedValue({});

      const res = await request(app).post("/api/user/logout").set(authHeader);

      expect(res.status).toBe(200);
      expect(mockRefreshToken.updateMany).toHaveBeenCalledWith(
        { user: authUser._id, revokedAt: null },
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
      expect(res.body.message).toBe("Todas las sesiones cerradas");
    });
  });

  describe("DELETE /api/user", () => {
    it("soft deletes the authenticated user when requested", async () => {
      mockUser.findById.mockResolvedValue(authUser);
      mockUser.softDeleteById.mockResolvedValue({});

      const res = await request(app)
        .delete("/api/user")
        .set(authHeader)
        .query({ soft: "true" });

      expect(res.status).toBe(200);
      expect(mockUser.softDeleteById).toHaveBeenCalledWith(authUser._id);
      expect(mockUser.hardDelete).not.toHaveBeenCalled();
      expect(res.body.message).toBe("Usuario eliminado (soft delete)");
    });

    it("hard deletes the authenticated user by default", async () => {
      mockUser.findById.mockResolvedValue(authUser);
      mockUser.hardDelete.mockResolvedValue({});

      const res = await request(app).delete("/api/user").set(authHeader);

      expect(res.status).toBe(200);
      expect(mockUser.hardDelete).toHaveBeenCalledWith(authUser._id);
      expect(mockUser.softDeleteById).not.toHaveBeenCalled();
      expect(res.body.message).toBe("Usuario eliminado (hard delete)");
    });
  });

  describe("POST /api/user/invite", () => {
    it("allows an admin to invite a guest user", async () => {
      const invitedUser = {
        _id: "507f1f77bcf86cd799439013",
        email: "guest@example.com",
        name: "Guest",
        lastName: "User",
        role: "guest",
        status: "pending",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      };
      mockUser.findById.mockResolvedValue(authUser);
      mockUser.create.mockResolvedValue(invitedUser);

      const res = await request(app)
        .post("/api/user/invite")
        .set(authHeader)
        .send({
          email: "guest@example.com",
          name: "Guest",
          lastName: "User",
          password: "Password123",
        });

      expect(res.status).toBe(201);
      expect(mockUser.create).toHaveBeenCalledWith({
        email: "guest@example.com",
        name: "Guest",
        lastName: "User",
        password: "hashed-password",
        company: authUser.company,
        role: "guest",
        status: "pending",
      });
      expect(res.body.message).toBe("Usuario invitado con éxito");
    });

    it("blocks authenticated non-admin users before the controller", async () => {
      mockUser.findById.mockResolvedValue({
        ...authUser,
        role: "guest",
      });

      const res = await request(app)
        .post("/api/user/invite")
        .set(authHeader)
        .send({
          email: "guest@example.com",
          name: "Guest",
          lastName: "User",
          password: "Password123",
        });

      expect(res.status).toBe(403);
      expect(mockUser.create).not.toHaveBeenCalled();
    });
  });
});
