import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockMongooseConnect = jest.fn();
const mockConnectionOn = jest.fn();
const mockWebhookSend = jest.fn();

jest.unstable_mockModule("mongoose", () => ({
  default: {
    connect: mockMongooseConnect,
    connection: { on: mockConnectionOn },
  },
}));

jest.unstable_mockModule("../../config/env.js", () => ({
  default: { DB_URI: "mongodb://example.test/db" },
}));

jest.unstable_mockModule("@slack/webhook", () => ({
  IncomingWebhook: jest.fn().mockImplementation(() => ({
    send: mockWebhookSend,
  })),
}));

process.env.SLACK_WEBHOOK = "https://hooks.slack.test/test";

const { default: dbConnect } = await import("../../config/db.js");
const { loggerStream, sendSlackNotification } = await import("../../utils/handleLogger.js");
const { criticalOperation } = await import("../../middleware/slack.middleware.js");

describe("database connection", () => {
  beforeEach(() => {
    mockMongooseConnect.mockReset();
    jest.restoreAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("connects to MongoDB and registers disconnected warnings", async () => {
    mockMongooseConnect.mockResolvedValue(undefined);

    await dbConnect();

    expect(mockMongooseConnect).toHaveBeenCalledWith("mongodb://example.test/db");
    expect(console.log).toHaveBeenCalledWith("Conectado a MongoDB");
    expect(mockConnectionOn).toHaveBeenCalledWith("disconnected", expect.any(Function));

    mockConnectionOn.mock.calls[0][1]();
    expect(console.warn).toHaveBeenCalledWith("Desconectado de MongoDB");
  });

  it("logs connection errors and exits with failure", async () => {
    mockMongooseConnect.mockRejectedValue(new Error("network down"));
    jest.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`exit:${code}`);
    });

    await expect(dbConnect()).rejects.toThrow("exit:1");

    expect(console.error).toHaveBeenCalledWith("Error conectando a MongoDB:", "network down");
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});

describe("Slack logging helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("sends logger stream messages to Slack and stderr", async () => {
    mockWebhookSend.mockResolvedValue(undefined);

    loggerStream.write("server exploded");
    await Promise.resolve();

    expect(mockWebhookSend).toHaveBeenCalledWith({
      text: expect.stringContaining("server exploded"),
    });
    expect(console.error).toHaveBeenCalledWith("server exploded");
  });

  it("handles Slack notification failures without throwing", async () => {
    mockWebhookSend.mockRejectedValue(new Error("slack down"));

    await expect(sendSlackNotification("deploy failed")).resolves.toBeUndefined();

    expect(mockWebhookSend).toHaveBeenCalledWith({ text: "deploy failed" });
    expect(console.error).toHaveBeenCalledWith("Error enviando a Slack:", expect.any(Error));
  });

  it("reports success and failure paths for critical operations", async () => {
    const res = {};

    await criticalOperation({}, res);

    expect(mockWebhookSend).toHaveBeenCalledWith({ text: "✅ Operación crítica completada" });
  });
});
