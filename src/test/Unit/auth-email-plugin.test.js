import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockJwtSign = jest.fn();
const mockJwtVerify = jest.fn();
const mockFindOne = jest.fn();
const mockUpdateMany = jest.fn();
const mockFindById = jest.fn();
const mockCreateToken = jest.fn();
const mockSendMail = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: mockJwtSign,
    verify: mockJwtVerify,
  },
}));

jest.unstable_mockModule("../../models/user.models.js", () => ({
  default: { findById: mockFindById },
}));

jest.unstable_mockModule("../../models/refreshToken.models.js", () => ({
  default: {
    findOne: mockFindOne,
    updateMany: mockUpdateMany,
    create: mockCreateToken,
  },
}));

jest.unstable_mockModule("../../config/emailSender.js", () => ({
  transporter: { sendMail: mockSendMail },
}));

const {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  refreshTokens,
  verifyAccessToken,
} = await import("../../utils/handleJWT.js");
const { encrypt, compare } = await import("../../utils/handlePassword.js");
const { sendVerificationEmail } = await import("../../utils/sendEmails.js");
const { softDeletePlugin } = await import("../../plugins/softDelete.plugin.js");

const createRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

describe("JWT and password utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockJwtSign.mockReturnValue("access-token");
    mockJwtVerify.mockReturnValue({ _id: "user-id", role: "admin" });
  });

  it("generates and verifies access tokens", () => {
    expect(generateAccessToken({ _id: "user-id", role: "admin" })).toBe("access-token");
    expect(mockJwtSign).toHaveBeenCalledWith(
      { _id: "user-id", role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );
    expect(verifyAccessToken("token")).toEqual({ _id: "user-id", role: "admin" });
    expect(mockJwtVerify).toHaveBeenCalledWith("token", process.env.JWT_SECRET);
  });

  it("returns null when token verification fails", () => {
    mockJwtVerify.mockImplementation(() => {
      throw new Error("invalid");
    });

    expect(verifyAccessToken("bad")).toBeNull();
  });

  it("creates opaque refresh tokens and future expiries", () => {
    expect(generateRefreshToken()).toHaveLength(128);
    expect(getRefreshTokenExpiry().getTime()).toBeGreaterThan(Date.now());
  });

  it("encrypts and compares passwords", async () => {
    const hash = await encrypt("Password123");

    expect(hash).not.toBe("Password123");
    await expect(compare("Password123", hash)).resolves.toBe(true);
    await expect(compare("WrongPassword", hash)).resolves.toBe(false);
  });
});

describe("refresh token rotation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockJwtSign.mockReturnValue("new-access-token");
  });

  it("rejects missing refresh tokens", async () => {
    mockFindOne.mockResolvedValue(null);
    const res = createRes();

    await refreshTokens({ body: { refreshToken: "missing" } }, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: true, message: "Token no encontrado" });
  });

  it("revokes all sessions when a revoked token is reused", async () => {
    mockFindOne.mockResolvedValue({ user: "user-id", revokedAt: new Date() });
    const res = createRes();

    await refreshTokens({ body: { refreshToken: "reused" } }, res);

    expect(mockUpdateMany).toHaveBeenCalledWith(
      { user: "user-id" },
      { revokedAt: expect.any(Date) },
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      message: "Token reutilizado - todas las sesiones revocadas",
    });
  });

  it("rejects inactive tokens", async () => {
    mockFindOne.mockResolvedValue({ revokedAt: null, isActive: () => false });
    const res = createRes();

    await refreshTokens({ body: { refreshToken: "expired" } }, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: true, message: "Token expirado" });
  });

  it("rotates active refresh tokens", async () => {
    const storedToken = {
      user: "user-id",
      revokedAt: null,
      isActive: () => true,
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockFindOne.mockResolvedValue(storedToken);
    mockFindById.mockResolvedValue({ _id: "user-id", role: "admin" });
    mockCreateToken.mockResolvedValue({});
    const res = createRes();

    await refreshTokens({ body: { refreshToken: "old-token" }, ip: "127.0.0.1" }, res);

    expect(storedToken.revokedAt).toBeInstanceOf(Date);
    expect(storedToken.save).toHaveBeenCalled();
    expect(mockCreateToken).toHaveBeenCalledWith(expect.objectContaining({
      user: "user-id",
      createdByIp: "127.0.0.1",
    }));
    expect(res.json).toHaveBeenCalledWith({
      accessToken: "new-access-token",
      refreshToken: expect.any(String),
    });
  });
});

describe("sendVerificationEmail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends a verification email", async () => {
    mockSendMail.mockImplementation((options, callback) => callback(null, { accepted: [options.to] }));

    await sendVerificationEmail("ada@example.com", "123456", "Ada");

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ada@example.com",
        subject: "Código de verificación",
        html: expect.stringContaining("123456"),
      }),
      expect.any(Function),
    );
  });

  it("rejects when the transporter reports an error", async () => {
    mockSendMail.mockImplementation((options, callback) => callback(new Error("smtp down")));

    await expect(
      sendVerificationEmail("ada@example.com", "123456", "Ada"),
    ).rejects.toMatchObject({
      statusCode: 500,
      code: "INTERNAL_ERROR",
    });
  });
});

describe("softDeletePlugin", () => {
  const buildSchema = () => ({
    add: jest.fn(),
    pre: jest.fn(),
    methods: {},
    statics: {},
  });

  it("adds fields, hooks, instance methods and statics", async () => {
    const schema = buildSchema();
    softDeletePlugin(schema);

    expect(schema.add).toHaveBeenCalledWith(expect.objectContaining({
      deleted: expect.objectContaining({ default: false }),
      deletedAt: expect.objectContaining({ default: null }),
      deletedBy: expect.objectContaining({ default: null }),
    }));
    expect(schema.pre).toHaveBeenCalledTimes(4);

    const query = {
      getOptions: jest.fn().mockReturnValue({}),
      where: jest.fn(),
    };
    schema.pre.mock.calls[0][1].call(query);
    expect(query.where).toHaveBeenCalledWith({ deleted: { $ne: true } });

    const withDeletedQuery = {
      getOptions: jest.fn().mockReturnValue({ withDeleted: true }),
      where: jest.fn(),
    };
    schema.pre.mock.calls[1][1].call(withDeletedQuery);
    expect(withDeletedQuery.where).not.toHaveBeenCalled();

    const document = {
      save: jest.fn().mockResolvedValue("saved"),
    };
    await expect(schema.methods.softDelete.call(document, "admin")).resolves.toBe("saved");
    expect(document).toMatchObject({ deleted: true, deletedBy: "admin" });
    expect(document.deletedAt).toBeInstanceOf(Date);

    await expect(schema.methods.restore.call(document)).resolves.toBe("saved");
    expect(document).toMatchObject({ deleted: false, deletedAt: null, deletedBy: null });
  });

  it("implements static helpers", () => {
    const schema = buildSchema();
    softDeletePlugin(schema);
    const setOptions = jest.fn().mockReturnValue("query");
    const model = {
      findByIdAndUpdate: jest.fn().mockReturnValue({ setOptions }),
      find: jest.fn().mockReturnValue({ setOptions }),
      findByIdAndDelete: jest.fn().mockReturnValue({ setOptions }),
    };

    expect(schema.statics.softDeleteById.call(model, "id", "admin")).resolves;
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      "id",
      expect.objectContaining({ deleted: true, deletedBy: "admin" }),
      { new: true },
    );
    expect(schema.statics.restoreById.call(model, "id")).resolves;
    expect(schema.statics.findWithDeleted.call(model, { role: "admin" })).toBe("query");
    expect(schema.statics.findDeleted.call(model, { role: "admin" })).toBe("query");
    expect(schema.statics.hardDelete.call(model, "id")).toBe("query");
  });

  it("uses default arguments in instance and static helpers", async () => {
    const schema = buildSchema();
    softDeletePlugin(schema);
    const document = {
      save: jest.fn().mockResolvedValue("saved"),
    };

    await expect(schema.methods.softDelete.call(document)).resolves.toBe("saved");
    expect(document.deletedBy).toBeNull();

    const setOptions = jest.fn().mockReturnValue("query");
    const model = {
      findByIdAndUpdate: jest.fn().mockReturnValue({ setOptions }),
      find: jest.fn().mockReturnValue({ setOptions }),
    };

    await expect(schema.statics.softDeleteById.call(model, "id")).resolves.toBe("query");
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      "id",
      expect.objectContaining({ deleted: true, deletedBy: null }),
      { new: true },
    );
    expect(schema.statics.findWithDeleted.call(model)).toBe("query");
    expect(model.find).toHaveBeenCalledWith({});
    expect(schema.statics.findDeleted.call(model)).toBe("query");
    expect(model.find).toHaveBeenLastCalledWith({ deleted: true });
  });
});
