// src/utils/handleStorage.js
import crypto from "node:crypto";
import multer from "multer";
import { extname } from "node:path";

// Filtro de tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "audio/mpeg",
    "audio/wav",
    "application/pdf",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido"), false);
  }
};

// Middleware de upload
const uploadMiddleware = multer({
  storage: multer.memoryStorage(), // Lo guarda en req.file.buffer
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5, // Máximo 5 archivos
  },
});

// Almacenamiento en disco
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generar nombre único
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// Almacenamiento en memoria (para subir a cloud)
const memoryStorage = multer.memoryStorage();

export const uploadDisk = multer({ storage: diskStorage });
export const uploadMemory = multer({ storage: memoryStorage });
export default uploadMiddleware;
