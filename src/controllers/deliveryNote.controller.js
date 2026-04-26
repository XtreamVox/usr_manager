import DeliveryNote from "../models/deliveryNote.models.js";
import User from "../models/user.models.js";
import { AppError } from "../utils/AppError.js";
import { generatePdfBuffer } from "../utils/handlePDF.js";
import cloudinaryService from "../services/cloudinary.service.js";
import downloadPdf from "../middleware/pdfDownloader.middleware.js";
import Client from "../models/client.models.js";
// TODO reescribir todos los 'findById' por 'findOne' para poder filtrar directamente por la company

export async function createDeliveryNote(req, res, next) {
  try {

    const client = await Client.findOne({_id: req.body.client, company: req.user.company})
    if (!client) throw AppError.notFound("No se encontró el cliente")

    const note = await DeliveryNote.create({
      user: req.user._id,
      company: req.user.company,
      ...req.body,
    });

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
}

export async function getAllDeliveryNotes(req, res, next) {
  try {
    const { limit, sort, page, filter, from, to } = req.query;
    const skip = (page - 1) * limit;
    const deliveryNotes = await DeliveryNote.find({
      ...filter,
      workDate: { $gt: from, $lt: to },
      company: req.user.company,
    })
      .populate(["Company", "User", "Client", "Project"])
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await DeliveryNote.countDocuments();
    res.json({
      data: deliveryNotes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDeliveryNote(req, res, next) {
  try {
    const { id } = req.params;

    const deliveryNote = await DeliveryNote.findOne({_id : id, company : req.user.company});
    if (!deliveryNote) throw AppError.notFound("No se encontró el albaran");

    res.status(200).json(deliveryNote);
  } catch (error) {
    next(error);
  }
}

export async function deleteDeliveryNote(req, res, next) {
  try {
    const { soft } = req.query;
    const { id } = req.params;

    const deliveryNote = await DeliveryNote.findOne({_id : id, company : req.user.company});
    if (!deliveryNote) throw AppError.notFound("No se encontró el albaran");
    if (deliveryNote.signed) throw AppError.forbidden("No se puede eliminar un albaran firmado");

    if (soft) {
      await deliveryNote.softDeleteById(id);
    } else {
      await deliveryNote.hardDelete(id);
    }

    res.status(200).json(client);
  } catch (error) {
    next(error);
  }
}

export async function getPdfFromDeliveryNote(req, res, next) {
  try {
    const { id } = req.params;
    const deliveryNote = await DeliveryNote.findOne({_id : id, company: req.user.company});
    if (!deliveryNote) throw AppError.notFound("No se encontró el albaran");
    
    let pdf;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      `Content-Disposition`,
      `attachment; filename=${deliveryNote.name}.pdf`,
    );

    if (deliveryNote.signed) {
      downloadPdf(deliveryNote.pdfUrl)
      pdf = req.pdf;
    } else pdf = generatePdfBuffer(deliveryNote);

    res.send(pdf);
  } catch (error) {
    next(error);
  }
}

export async function signPdf(req, res, next) {
  try {
    const { id } = req.params;
    const binarySignature = req.file.buffer;
    const deliveryNote = await DeliveryNote.findOne({_id : id, company : req.user.company});
    if (!deliveryNote) throw AppError.notFound("No se encontró el albaran");

    const firmaUrl = await cloudinaryService.uploadImage(binarySignature);

    deliveryNote.signatureUrl = firmaUrl.secure_url;
    deliveryNote.signed = true;
    deliveryNote.signedAt = Date.now();

    const pdf = generatePdfBuffer(deliveryNote);
    const pdfUrl = await cloudinaryService.uploadPdf(pdf);

    deliveryNote.pdfUrl = pdfUrl.secure_url;
    await deliveryNote.save();

    res.status(200).json(deliveryNote);
  } catch (error) {
    next(error);
  }
}
