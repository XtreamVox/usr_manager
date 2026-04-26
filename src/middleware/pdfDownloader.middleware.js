import { application } from "express";
import { AppError } from "../utils/AppError.js";

//TODO se ejecuta de forma puntual, no es un middleware

import https from "https";

const downloadPdf = (url) => (req, res, next) => {
  https.get(url, (response) => {
      // Verificar que Cloudinary responda con éxito (status 200)
      if (response.statusCode !== 200) {
        throw AppError.badRequest(
          "Cloudinary no responde o no encontro el archivo",
        );
      }

      const chunks = [];

      response.on("data", (chunk) => {
        chunks.push(chunk);
      });

      response.on("end", () => {
        const fileBuffer = Buffer.concat(chunks);
        req.pdf = fileBuffer;
      });
    })
    .on("error", (error) => {
      next(e);
    });
  next();
};

export default downloadPdf;
