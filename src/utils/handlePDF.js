import https from "https";
import PDFDocument from "pdfkit";
import { AppError } from "../utils/AppError.js";

export async function returnPdf(req, res, next) {
  try {
    var doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="albaransinfirma.pdf"',
    );

    doc.pipe(res);

    doc.text("Aprendiendo a usar pdfkit u cloudinary", 100, 450);
    doc.circle(280, 200, 50).fill("#6600FF");
    doc.end();

    res.status(200).json();
  } catch (error) {
    next(error);
  }
}

export const generatePdfBuffer = async (deliveryNote) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    // Callbacks
    doc.on("data", (chunk) => buffers.push(chunk));

    doc.on("end", () => {
      // pasar el array a binario
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc.on("error", reject);

    // Contenido del PDF
    doc.fontSize(20).text("Albarán", { align: "center" });

    doc.moveDown();
    doc.fontSize(12).text(`Cliente: ${deliveryNote.client.name}`);
    doc.text(`Proyecto: ${deliveryNote.project.name}`);
    doc.text(`Descripción: ${deliveryNote.description}`);
    doc.text(`Horas: ${deliveryNote.hours}`);

    if (deliveryNote.format === "hours") {
      deliveryNote.workers?.data?.forEach((w) => {
        doc.text(`Nombre: ${w.name} | Horas: ${w.hours}`);
      });
    }

    if (deliveryNote.format === "material") {
      deliveryNote.material?.data?.forEach((m) => {
        doc.text(`Nombre: ${m.name} | Cantidad: ${m.quantity}`);
      });

      if (deliveryNote.signed) {
        // recoger imagen firma cloudinary
        doc.image(deliveryNote.signatureUrl);
      }
    }

    doc.end();
  });
};

export const downloadPdf = (url, redirects = 0) => {
  if (!url) {
    return Promise.reject(AppError.badRequest("URL del PDF requerida"));
  }

  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        const { statusCode, headers } = response;

        if ([301, 302, 303, 307, 308].includes(statusCode) && headers.location) {
          response.resume();

          if (redirects >= 3) {
            reject(AppError.badRequest("Demasiadas redirecciones al descargar el PDF"));
            return;
          }

          resolve(downloadPdf(headers.location, redirects + 1));
          return;
        }

        if (statusCode !== 200) {
          response.resume();
          reject(AppError.badRequest("Cloudinary no responde o no encontró el archivo"));
          return;
        }

        const chunks = [];

        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
        response.on("error", () => {
          reject(AppError.internal("Fallo al descargar desde Cloudinary"));
        });
      })
      .on("error", () => {
        reject(AppError.internal("Fallo al descargar desde Cloudinary"));
      });
  });
};
