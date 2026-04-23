import PDFDocument from "pdfkit"
import cloudinaryService from '../services/cloudinary.service.js'
import { buffer } from "stream/consumers"
import { equal } from "assert"
import { AppError } from "../utils/AppError.js"
import { format } from "path"
import { access } from "fs"

export async function returnPdf(req, res,next) {

    try {
        var doc = new PDFDocument()

        res.setHeader('Content-Type','application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename="albaransinfirma.pdf"')

        doc.pipe(res)

        doc.text('Aprendiendo a usar pdfkit u cloudinary',100,450)
        doc.circle(280,200,50).fill("#6600FF")
        doc.end()

        res.status(200).json()
    } catch (error) {
        next(error)
    }
}

export const generatePdfBuffer = async (deliveryNote) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    // Callbacks
    doc.on('data', (chunk) => buffers.push(chunk));

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
    };

    if (deliveryNote.format === "material") {
      deliveryNote.material?.data?.forEach((m) => {
        doc.text(`Nombre: ${m.name} | Cantidad: ${m.quantity}`);
      });

    if(deliveryNote.signed){
        // recoger imagen firma cloudinary
        doc.image(deliveryNote.signatureUrl);
    }
}

    doc.end();
  });
};