import https from "https";
import { EventEmitter } from "events";
import { afterEach, describe, it, expect, jest } from "@jest/globals";
import { generatePdfBuffer, downloadPdf } from "../../utils/handlePDF.js";

describe("PDF utilities", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createHttpsResponse = (statusCode, headers = {}) => {
    const response = new EventEmitter();
    response.statusCode = statusCode;
    response.headers = headers;
    response.resume = jest.fn();
    return response;
  };

  it("generates a signed PDF buffer and handles an invalid signature image gracefully", async () => {
    const deliveryNote = {
      signed: true,
      signedAt: Date.now(),
      workDate: new Date(),
      format: "material",
      client: { name: "Cliente Test" },
      project: { name: "Proyecto Test" },
      description: "Descripción de prueba",
      material: { data: [], unit: "uds" },
    };

    const buffer = await generatePdfBuffer(
      deliveryNote,
      Buffer.from("not-a-real-image"),
    );

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("generates a PDF for hour notes with worker rows", async () => {
    const deliveryNote = {
      signed: false,
      workDate: new Date("2026-01-15T10:00:00.000Z"),
      format: "hours",
      client: { description: "Cliente por descripcion" },
      project: { description: "Proyecto por descripcion" },
      description: null,
      workers: {
        data: [
          { name: "Ada", hours: 4 },
          { name: null, hours: undefined },
        ],
      },
    };

    const buffer = await generatePdfBuffer(deliveryNote);

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("generates placeholder sections when note data is missing", async () => {
    const deliveryNote = {
      signed: false,
      workDate: null,
      format: "hours",
      client: {},
      project: {},
      workers: { data: [] },
    };

    const buffer = await generatePdfBuffer(deliveryNote);

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("generates material rows with fallback unit text", async () => {
    const deliveryNote = {
      signed: false,
      workDate: new Date("2026-02-10T10:00:00.000Z"),
      format: "material",
      client: { name: "Cliente Test" },
      project: { name: "Proyecto Test" },
      description: "Materiales",
      material: {
        unit: "",
        data: [{ name: "Cable", quantity: 12 }],
      },
    };

    const buffer = await generatePdfBuffer(deliveryNote);

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("rejects downloadPdf when URL is missing", async () => {
    await expect(downloadPdf()).rejects.toThrow("URL del PDF requerida");
  });

  it("downloads a PDF buffer from a successful https response", async () => {
    const testData = Buffer.from("pdf-bytes");
    const response = new EventEmitter();
    response.statusCode = 200;
    response.headers = {};

    const requestMock = new EventEmitter();
    const httpsGetSpy = jest
      .spyOn(https, "get")
      .mockImplementation((url, callback) => {
        process.nextTick(() => {
          callback(response);
          response.emit("data", testData);
          response.emit("end");
        });
        return requestMock;
      });

    const pdf = await downloadPdf("https://example.com/file.pdf");

    expect(pdf).toEqual(testData);
    expect(httpsGetSpy).toHaveBeenCalledWith(
      "https://example.com/file.pdf",
      expect.any(Function),
    );
  });

  it("follows redirects before downloading a PDF", async () => {
    const redirectResponse = createHttpsResponse(302, {
      location: "https://cdn.example.com/file.pdf",
    });
    const successResponse = createHttpsResponse(200);
    const requestMock = new EventEmitter();
    const httpsGetSpy = jest
      .spyOn(https, "get")
      .mockImplementation((url, callback) => {
        process.nextTick(() => {
          if (url === "https://example.com/redirect") {
            callback(redirectResponse);
            return;
          }

          callback(successResponse);
          successResponse.emit("data", Buffer.from("redirected-pdf"));
          successResponse.emit("end");
        });
        return requestMock;
      });

    const pdf = await downloadPdf("https://example.com/redirect");

    expect(pdf).toEqual(Buffer.from("redirected-pdf"));
    expect(redirectResponse.resume).toHaveBeenCalled();
    expect(httpsGetSpy).toHaveBeenCalledTimes(2);
  });

  it("rejects when too many redirects are returned", async () => {
    const redirectResponse = createHttpsResponse(302, {
      location: "https://example.com/again",
    });
    const requestMock = new EventEmitter();
    jest.spyOn(https, "get").mockImplementation((url, callback) => {
      process.nextTick(() => callback(redirectResponse));
      return requestMock;
    });

    await expect(downloadPdf("https://example.com/redirect")).rejects.toThrow(
      "Demasiadas redirecciones al descargar el PDF",
    );
    expect(redirectResponse.resume).toHaveBeenCalled();
  });

  it("rejects non-success responses without redirect locations", async () => {
    const response = createHttpsResponse(302);
    const requestMock = new EventEmitter();
    jest.spyOn(https, "get").mockImplementation((url, callback) => {
      process.nextTick(() => callback(response));
      return requestMock;
    });

    await expect(downloadPdf("https://example.com/missing-location")).rejects.toThrow(
      "Cloudinary no responde o no encontró el archivo",
    );
    expect(response.resume).toHaveBeenCalled();
  });

  it("rejects response stream and request errors", async () => {
    const response = createHttpsResponse(200);
    let requestMock = new EventEmitter();
    const httpsGetSpy = jest
      .spyOn(https, "get")
      .mockImplementationOnce((url, callback) => {
        process.nextTick(() => {
          callback(response);
          response.emit("error", new Error("stream failed"));
        });
        return requestMock;
      });

    await expect(downloadPdf("https://example.com/stream-error")).rejects.toThrow(
      "Fallo al descargar desde Cloudinary",
    );

    requestMock = new EventEmitter();
    httpsGetSpy.mockImplementationOnce(() => {
      process.nextTick(() => requestMock.emit("error", new Error("request failed")));
      return requestMock;
    });

    await expect(downloadPdf("https://example.com/request-error")).rejects.toThrow(
      "Fallo al descargar desde Cloudinary",
    );
  });
});
