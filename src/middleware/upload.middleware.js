// Middleware de upload
const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,  // 10MB
    files: 5                      // Máximo 5 archivos
  }
});

export default uploadMiddleware;