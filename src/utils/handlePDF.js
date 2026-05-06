import https from "https";
import PDFDocument from "pdfkit";
import { AppError } from "../utils/AppError.js";

export async function returnPdf(req, res, next) {
  try {
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="albaransinfirma.pdf"',
    );

    doc.pipe(res);

    doc.fontSize(22).fillColor("#0B3D91").font("Helvetica-Bold").text("Albarán demo", {
      align: "center",
    });
    doc.moveDown();
    doc.fontSize(12).fillColor("#333333").font("Helvetica").text(
      "Este PDF es un ejemplo de cómo se renderiza el albarán con una presentación más cuidada.",
      {
        align: "left",
        lineGap: 4,
      },
    );

    doc.moveDown(2);
    doc.lineWidth(2).strokeColor("#0B3D91").moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.end();
  } catch (error) {
    next(error);
  }
}

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const normalizedText = (text) => (text || "-").toString();

const drawHorizontalLine = (doc, y) => {
  doc.save();
  doc.strokeColor("#CCCCCC").lineWidth(0.5).moveTo(40, y).lineTo(555, y).stroke();
  doc.restore();
};

export const generatePdfBuffer = async (deliveryNote, signedBuffer) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.info.Title = "Albarán";

    doc.fillColor("#0B3D91").fontSize(22).font("Helvetica-Bold").text("ALBARÁN", {
      align: "center",
    });

    doc.moveDown(0.5);
    drawHorizontalLine(doc, doc.y);
    doc.moveDown(1);

    doc.fillColor("#333333").fontSize(10).font("Helvetica-Bold").text("Detalles del albarán");
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(10);
    doc.text(`Fecha del trabajo: ${formatDate(deliveryNote.workDate)}`);
    doc.text(`Tipo: ${deliveryNote.format === "material" ? "Material" : "Horas"}`);
    doc.text(`Cliente: ${normalizedText(deliveryNote.client?.name || deliveryNote.client?.description)}`);
    doc.text(`Proyecto: ${normalizedText(deliveryNote.project?.name || deliveryNote.project?.description)}`);
    doc.text(`Descripción: ${normalizedText(deliveryNote.description)}`);

    doc.moveDown(1);
    drawHorizontalLine(doc, doc.y);
    doc.moveDown(1);

    if (deliveryNote.format === "hours") {
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#0B3D91").text("Detalle de horas");
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#333333");
      doc.text("Nombre", 40, doc.y, { continued: true });
      doc.text("Horas", 300, doc.y, { align: "left" });
      doc.moveDown(0.3);
      drawHorizontalLine(doc, doc.y);
      doc.moveDown(0.5);

      if (Array.isArray(deliveryNote.workers?.data) && deliveryNote.workers.data.length) {
        doc.font("Helvetica").fontSize(10).fillColor("#000000");
        deliveryNote.workers.data.forEach((worker) => {
          doc.text(normalizedText(worker.name), 40, doc.y, { continued: true });
          doc.text(normalizedText(worker.hours), 300, doc.y, { align: "left" });
          doc.moveDown(0.5);
        });
      } else {
        doc.font("Helvetica").fontSize(10).fillColor("#666666").text("No hay datos de horas para este albarán.");
      }
    } else {
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#0B3D91").text("Detalle de materiales");
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#333333");
      doc.text("Nombre", 40, doc.y, { continued: true });
      doc.text("Cantidad", 300, doc.y, { continued: true });
      doc.text("Unidad", 430, doc.y, { align: "left" });
      doc.moveDown(0.3);
      drawHorizontalLine(doc, doc.y);
      doc.moveDown(0.5);

      if (Array.isArray(deliveryNote.material?.data) && deliveryNote.material.data.length) {
        doc.font("Helvetica").fontSize(10).fillColor("#000000");
        deliveryNote.material.data.forEach((item) => {
          doc.text(normalizedText(item.name), 40, doc.y, { continued: true });
          doc.text(normalizedText(item.quantity), 300, doc.y, { continued: true });
          doc.text(normalizedText(deliveryNote.material?.unit), 430, doc.y, { align: "left" });
          doc.moveDown(0.5);
        });
      } else {
        doc.font("Helvetica").fontSize(10).fillColor("#666666").text("No hay datos de material para este albarán.");
      }
    }

    if (deliveryNote.signed && signedBuffer) {
      doc.moveDown(1);
      drawHorizontalLine(doc, doc.y);
      doc.moveDown(1);
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#0B3D91").text("Firma");
      doc.moveDown(0.5);
      doc.font("Helvetica").fontSize(10).fillColor("#333333");
      doc.text(`Firmado el: ${formatDate(deliveryNote.signedAt)}`);
      doc.moveDown(0.5);
      try {
        doc.image(signedBuffer, {
          fit: [250, 100],
          align: "left",
        });
      } catch (error) {
        doc.fillColor("#FF0000").fontSize(9).text("No se pudo incrustar la imagen de la firma.");
      }
    }

    doc.moveDown(2);
    doc.fontSize(9).fillColor("#777777").font("Helvetica").text(
      `Documento generado por usr_manager - ${formatDate(new Date())}`,
      { align: "center" },
    );
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

        if (
          [301, 302, 303, 307, 308].includes(statusCode) &&
          headers.location
        ) {
          response.resume();

          if (redirects >= 3) {
            reject(
              AppError.badRequest(
                "Demasiadas redirecciones al descargar el PDF",
              ),
            );
            return;
          }

          resolve(downloadPdf(headers.location, redirects + 1));
          return;
        }

        if (statusCode !== 200) {
          response.resume();
          reject(
            AppError.badRequest(
              "Cloudinary no responde o no encontró el archivo",
            ),
          );
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
