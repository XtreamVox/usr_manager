import DeliveryNote from "../models/deliveryNote.models.js";
import User from "../models/user.models.js";
import { AppError } from "../utils/AppError.js";
import { generatePdfBuffer, downloadPdf } from "../utils/handlePDF.js";
import cloudinaryService from "../services/cloudinary.service.js";
import Client from "../models/client.models.js";
import Project from "../models/project.models.js";
import { emitToCompany, SOCKET_EVENTS } from "../services/socket.service.js";

export async function createDeliveryNote(req, res, next) {
  const project = await Project.findOne({
    _id: req.body.project,
    client: req.body.client,
    company: req.user.company,
  });
  if (!project) throw AppError.notFound("No se encontró el proyecto asociado");

  const note = await DeliveryNote.create({
    user: req.user._id,
    company: req.user.company,
    ...req.body,
  });

  emitToCompany(note.company, SOCKET_EVENTS.DELIVERYNOTE_NEW, note);
  res.status(201).json(note);
}

export async function getAllDeliveryNotes(req, res, next) {
  const { limit, sort, page, filters, from, to } = req.query;
  const query = {
    ...filters,
    company: req.user.company,
  };

  if (from || to) {
    query.workDate = {};
    if (from) query.workDate.$gte = from;
    if (to) query.workDate.$lte = to;
  }

  const skip = (page - 1) * limit;
  const deliveryNotes = await DeliveryNote.find(query)
    .populate("company", "description")
    .populate("user", "description")
    .populate("client", "description")
    .populate("project", "description")
    .skip(skip)
    .limit(limit)
    .sort(sort);

  const total = await DeliveryNote.countDocuments(query);
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
}

export async function getDeliveryNote(req, res, next) {
  const { id } = req.params;

  const query = DeliveryNote.findOne({
    _id: id,
    company: req.user.company,
  });
  const deliveryNote =
    typeof query.populate === "function"
      ? await query.populate(["user", "project", "client"])
      : await query;

  if (!deliveryNote) throw AppError.notFound("No se encontró el albaran");

  res.status(200).json(deliveryNote);
}

export async function deleteDeliveryNote(req, res, next) {
  const { soft } = req.query;
  const { id } = req.params;

  const deliveryNote = await DeliveryNote.findOne({
    _id: id,
    company: req.user.company,
  });
  if (!deliveryNote) throw AppError.notFound("No se encontró el albaran");
  if (deliveryNote.signed)
    throw AppError.forbidden("No se puede eliminar un albaran firmado");

  if (soft) {
    await DeliveryNote.softDeleteById(id);
  } else {
    await DeliveryNote.hardDelete(id);
  }

  res.status(200).json(deliveryNote);
}

export async function getPdfFromDeliveryNote(req, res, next) {
  const { id } = req.params;
  const query = DeliveryNote.findOne({
    _id: id,
    company: req.user.company,
  });
  const deliveryNote =
    typeof query.populate === "function"
      ? await query.populate(["client", "project"])
      : await query;

  if (!deliveryNote) throw AppError.notFound("No se encontró el albaran");

  let pdf;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    `Content-Disposition`,
    `attachment; filename=${deliveryNote.name}.pdf`,
  );

  if (deliveryNote.signed) {
    pdf = await downloadPdf(deliveryNote.pdfUrl);
  } else pdf = await generatePdfBuffer(deliveryNote);

  res.send(pdf);
}

export async function signPdf(req, res, next) {
  const { id } = req.params;
  if (!req.file) throw AppError.badRequest("Archivo de firma requerido");

  const binarySignature = req.file.buffer;
  const query = DeliveryNote.findOne({
    _id: id,
    company: req.user.company,
  });
  const deliveryNote = await query.populate(["client", "project"]);

  if (!deliveryNote) throw AppError.notFound("No se encontró el albaran");
  if (deliveryNote.signed)
    throw AppError.forbidden("No se puede volver a firmar un albaran firmado");

  const firmaUrl = await cloudinaryService.uploadImage(binarySignature);

  deliveryNote.signatureUrl = firmaUrl.secure_url;
  deliveryNote.signed = true;
  deliveryNote.signedAt = Date.now();

  const pdf = await generatePdfBuffer(deliveryNote);
  const pdfUrl = await cloudinaryService.uploadPdf(pdf);

  deliveryNote.pdfUrl = pdfUrl.secure_url;
  await deliveryNote.save();

  emitToCompany(
    deliveryNote.company,
    SOCKET_EVENTS.DELIVERYNOTE_SIGNED,
    deliveryNote,
  );
  res.status(200).json(deliveryNote);
}
