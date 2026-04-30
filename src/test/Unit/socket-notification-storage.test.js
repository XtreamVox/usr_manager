import { unlink } from "node:fs/promises";
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockFindById = jest.fn();
const mockVerifyAccessToken = jest.fn();

jest.unstable_mockModule("../../models/user.models.js", () => ({
  default: { findById: mockFindById },
}));

jest.unstable_mockModule("../../utils/handleJWT.js", () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

const eventEmitter = (await import("../../services/event.service.js")).default;
const { EVENTS } = await import("../../services/event.service.js");
const { initializeNotificationListeners } = await import("../../services/notification.service.js");
const { configureSocketIo, emitToCompany, SOCKET_EVENTS } = await import("../../services/socket.service.js");
const { default: uploadMiddleware, uploadDisk, uploadMemory } = await import("../../utils/handleStorage.utils.js");

describe("notification listeners", () => {
  beforeEach(() => {
    eventEmitter.removeAllListeners();
    jest.restoreAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("registers listeners that log meaningful user lifecycle data", () => {
    initializeNotificationListeners();

    eventEmitter.emit(EVENTS.USER_REGISTERED, {
      email: "ada@example.com",
      name: "Ada",
      role: "admin",
      status: "pending",
      timestamp: "now",
    });
    eventEmitter.emit(EVENTS.USER_VERIFIED, {
      email: "ada@example.com",
      verifiedAt: "verified-now",
      timestamp: "now",
    });
    eventEmitter.emit(EVENTS.USER_INVITED, {
      email: "grace@example.com",
      invitedBy: "ada@example.com",
      invitedAt: "invite-now",
      timestamp: "now",
    });
    eventEmitter.emit(EVENTS.USER_DELETED, {
      email: "linus@example.com",
      deletedAt: "delete-now",
      deleteType: "soft",
      timestamp: "now",
    });

    const logs = console.log.mock.calls.flat().join("\n");
    expect(logs).toContain("Listeners de notificación inicializados");
    expect(logs).toContain("ada@example.com");
    expect(logs).toContain("grace@example.com");
    expect(logs).toContain("linus@example.com");
    expect(logs).toContain("soft delete");
  });
});

describe("socket service", () => {
  const buildIo = () => ({
    use: jest.fn(),
    on: jest.fn(),
    to: jest.fn().mockReturnValue({ emit: jest.fn() }),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("authenticates sockets, stores user data and joins the company room", async () => {
    const io = buildIo();
    configureSocketIo(io);
    const middleware = io.use.mock.calls[0][0];
    const connectionHandler = io.on.mock.calls[0][1];
    const socket = {
      id: "socket-1",
      handshake: { auth: {}, query: {}, headers: { authorization: "Bearer access-token" } },
      data: {},
      join: jest.fn(),
      on: jest.fn(),
    };
    const next = jest.fn();
    mockVerifyAccessToken.mockReturnValue({ _id: "user-1" });
    mockFindById.mockResolvedValue({ _id: "user-1", company: { _id: "company-1" } });

    await middleware(socket, next);
    connectionHandler(socket);
    socket.on.mock.calls[0][1]();

    expect(mockVerifyAccessToken).toHaveBeenCalledWith("access-token");
    expect(socket.data).toMatchObject({
      user: { _id: "user-1", company: { _id: "company-1" } },
      companyRoom: "company-1",
    });
    expect(next).toHaveBeenCalledWith();
    expect(socket.join).toHaveBeenCalledWith("company-1");
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("[WS] Conectado"));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("[WS] Desconectado"));
  });

  it("rejects sockets without a valid token user", async () => {
    const io = buildIo();
    configureSocketIo(io);
    const middleware = io.use.mock.calls[0][0];
    const next = jest.fn();

    mockVerifyAccessToken.mockReturnValue(null);

    await middleware({ handshake: { auth: {}, query: {}, headers: {} }, data: {} }, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe("Authentication error");
    expect(mockFindById).not.toHaveBeenCalled();
  });

  it("rejects sockets when the user has no company room", async () => {
    const io = buildIo();
    configureSocketIo(io);
    const middleware = io.use.mock.calls[0][0];
    const next = jest.fn();

    mockVerifyAccessToken.mockReturnValue({ _id: "user-1" });
    mockFindById.mockResolvedValue({ _id: "user-1", company: null });

    await middleware({ handshake: { auth: { token: "token" }, query: {}, headers: {} }, data: {} }, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe("Authentication error");
  });

  it("emits events only when a configured io and company room are available", () => {
    const io = buildIo();
    configureSocketIo(io);

    expect(emitToCompany(null, SOCKET_EVENTS.CLIENT_NEW, { id: "client-1" })).toBe(false);
    expect(emitToCompany({ _id: "company-1" }, SOCKET_EVENTS.CLIENT_NEW, { id: "client-1" })).toBe(true);

    expect(io.to).toHaveBeenCalledWith("company-1");
    expect(io.to.mock.results[0].value.emit).toHaveBeenCalledWith(
      SOCKET_EVENTS.CLIENT_NEW,
      { id: "client-1" },
    );
  });
});

describe("storage upload middleware", () => {
  const buildApp = (middleware, mapper = (req) => ({
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    buffer: req.file.buffer.toString("utf8"),
  })) => {
    const app = express();
    app.post("/upload", middleware.single("file"), (req, res) => {
      res.status(201).json(mapper(req));
    });
    app.use((err, req, res, next) => {
      res.status(400).json({ message: err.message });
    });
    return app;
  };

  it("accepts allowed memory uploads and exposes the uploaded buffer", async () => {
    const response = await request(buildApp(uploadMiddleware))
      .post("/upload")
      .attach("file", Buffer.from("hello"), {
        filename: "hello.pdf",
        contentType: "application/pdf",
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      originalname: "hello.pdf",
      mimetype: "application/pdf",
      buffer: "hello",
    });
  });

  it("rejects disallowed upload mime types", async () => {
    const response = await request(buildApp(uploadMiddleware))
      .post("/upload")
      .attach("file", Buffer.from("bad"), {
        filename: "script.js",
        contentType: "application/javascript",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Tipo de archivo no permitido" });
  });

  it("exports memory storage for cloud upload routes", async () => {
    const response = await request(buildApp(uploadMemory))
      .post("/upload")
      .attach("file", Buffer.from("avatar"), {
        filename: "avatar.png",
        contentType: "image/png",
      });

    expect(response.status).toBe(201);
    expect(response.body.buffer).toBe("avatar");
  });

  it("stores disk uploads with generated lowercase extensions", async () => {
    const response = await request(buildApp(uploadDisk, (req) => ({
      filename: req.file.filename,
      path: req.file.path,
    })))
      .post("/upload")
      .attach("file", Buffer.from("disk"), {
        filename: "Invoice.PDF",
        contentType: "application/pdf",
      });

    expect(response.status).toBe(201);
    expect(response.body.filename).toMatch(/^[a-f0-9]{32}\.pdf$/);
    expect(response.body.path).toBe(`uploads/${response.body.filename}`);

    await unlink(response.body.path);
  });
});
