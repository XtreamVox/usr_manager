import DeliveryNote from "../models/deliveryNote.models.js";
import User from "../models/user.models.js";
import { AppError } from "../utils/AppError.js";
import { generatePdfBuffer } from "../utils/handlePDF.js";
import cloudinaryService from "../services/cloudinary.service.js";
import downloadPdf from "../middleware/pdfDownloader.middleware.js";
// TODO reescribir todos los 'findById' por 'findOne' para poder filtrar directamente por la company

export async function createDeliveryNote(req, res, next) {
  try {
    const note = DeliveryNote.create({
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

    const deliveryNote = await DeliveryNote.findById(id);
    if (req.user.company != deliveryNote.company)
      throw AppError.forbidden(
        "Solo puede acceder a la información de su company",
      );

    res.status(200).json(deliveryNote);
  } catch (error) {
    next(error);
  }
}

export async function deleteDeliveryNote(req, res, next) {
  try {
    const { soft } = req.query;
    const { id } = req.params;

    const deliveryNote = await DeliveryNote.findById(id);
    if (deliveryNote.signed)
      throw AppError.badRequest("No se puede eliminar un albaran firmado");

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
    const nota = await DeliveryNote.findById(id);
    let pdf;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      `Content-Disposition`,
      `attachment; filename=${nota.name}.pdf`,
    );

    if (nota.company != req.user.company) {
      throw AppError.forbidden(
        "Solo puede acceder a la información de su company",
      );
    }

    if (nota.signed) {
      downloadPdf(nota.pdfUrl)
      pdf = req.pdf;
    } else pdf = generatePdfBuffer(nota);

    res.send(pdf);
  } catch (error) {
    next(error);
  }
}

export async function signPdf(req, res, next) {
  try {
    const { id } = req.params;
    const binarySignatura = req.file.buffer;
    const nota = await DeliveryNote.findById(id);

    const firmaUrl = await cloudinaryService.uploadImage(binarySignatura);

    nota.signatureUrl = firmaUrl.secure_url;
    nota.signed = true;
    nota.signedAt = Date.now();

    const pdf = generatePdfBuffer(nota);
    const pdfUrl = await cloudinaryService.uploadPdf(pdf);

    nota.pdfUrl = pdfUrl.secure_url;
    await nota.save();

    res.status(200).json(nota);
  } catch (error) {
    next(error);
  }
}
