import { PassThrough } from "node:stream";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockUploadStream = jest.fn();
const mockDestroy = jest.fn();
const mockDeleteResources = jest.fn();
const mockUrl = jest.fn();

jest.unstable_mockModule("../../config/cloudinary.js", () => ({
  default: {
    uploader: {
      upload_stream: mockUploadStream,
      destroy: mockDestroy,
    },
    api: {
      delete_resources: mockDeleteResources,
    },
    url: mockUrl,
  },
}));

const { default: cloudinaryService } = await import("../../services/cloudinary.service.js");

describe("CloudinaryService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUploadStream.mockImplementation((options, callback) => {
      const stream = new PassThrough();
      stream.on("finish", () => callback(null, { public_id: "file-id", options }));
      return stream;
    });
    mockDestroy.mockResolvedValue({ result: "ok" });
    mockDeleteResources.mockResolvedValue({ deleted: { a: "deleted" } });
    mockUrl.mockImplementation((publicId, options) => `url:${publicId}:${JSON.stringify(options)}`);
  });

  it("uploads a buffer with default and custom options", async () => {
    const result = await cloudinaryService.uploadBuffer(Buffer.from("file"), {
      folder: "docs",
      publicId: "custom-id",
      resourceType: "raw",
      transformation: [{ quality: "auto" }],
    });

    expect(result).toEqual({
      public_id: "file-id",
      options: expect.objectContaining({
        folder: "docs",
        public_id: "custom-id",
        resource_type: "raw",
        transformation: [{ quality: "auto" }],
      }),
    });
  });

  it("rejects upload errors", async () => {
    mockUploadStream.mockImplementation((options, callback) => {
      const stream = new PassThrough();
      stream.on("finish", () => callback(new Error("upload failed")));
      return stream;
    });

    await expect(cloudinaryService.uploadBuffer(Buffer.from("bad"))).rejects.toThrow("upload failed");
  });

  it("applies presets for image, pdf, signatures and avatar uploads", async () => {
    await cloudinaryService.uploadImage(Buffer.from("image"), { folder: "custom" });
    await cloudinaryService.uploadPdf(Buffer.from("pdf"));
    await cloudinaryService.uploadSignatures(Buffer.from("signature"));
    await cloudinaryService.uploadAvatar(Buffer.from("avatar"), "123");

    expect(mockUploadStream).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ folder: "custom", resource_type: "image" }),
      expect.any(Function),
    );
    expect(mockUploadStream).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ folder: "pdf", resource_type: "raw" }),
      expect.any(Function),
    );
    expect(mockUploadStream).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ folder: "signatures", resource_type: "image" }),
      expect.any(Function),
    );
    expect(mockUploadStream).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        folder: "avatars",
        public_id: "user_123",
        overwrite: true,
      }),
      expect.any(Function),
    );
  });

  it("deletes files and builds cloudinary URLs", async () => {
    await expect(cloudinaryService.delete("one")).resolves.toEqual({ result: "ok" });
    await expect(cloudinaryService.deleteMany(["one"], "raw")).resolves.toEqual({
      deleted: { a: "deleted" },
    });

    const optimized = cloudinaryService.getOptimizedUrl("one", { width: 100 });
    const transformed = cloudinaryService.getTransformedUrl("two", [{ crop: "fill" }]);

    expect(mockDestroy).toHaveBeenCalledWith("one", { resource_type: "image" });
    expect(mockDeleteResources).toHaveBeenCalledWith(["one"], { resource_type: "raw" });
    expect(optimized).toContain("url:one");
    expect(mockUrl).toHaveBeenCalledWith("one", {
      fetch_format: "auto",
      quality: "auto",
      width: 100,
    });
    expect(transformed).toContain("url:two");
    expect(mockUrl).toHaveBeenCalledWith("two", {
      transformation: [{ crop: "fill" }],
    });
  });
});
