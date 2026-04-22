import DeliveryNote from "../models/deliveryNote.models.js";
import { AppError } from "../utils/AppError.js";
import {returnPdf, signPdf} from "../utils/handlePDF.js"
export async function createDeliveryNote(req, res, next){    
    try {
        if (req.user.company == null) throw AppError.badRequest("El usuario debe tener una comapny asociada"); 
    
        const note = DeliveryNote.create({user: req.user._id, company: req.user.company, ...req.body})

        res.status(201).json(note)
    } catch (error) {
        next(error)
    }
}

export async function getAllDeliveryNotes(req, res, next) {
  try {
    // TODO gestionar querys y establecer defaults con zod
    const { limit, sort, page, filter, from, to } = req.query;
    const skip = (page - 1) * limit;
    const deliveryNotes = await DeliveryNote.find({...filter, workDate: {$gt: from, $lt: to}})
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

    const deliveryNote = await deliveryNote.findById(id);

    res.status(200).json(deliveryNote);
  } catch (error) {
    next(error);
  }
}

export async function deleteDeliveryNote(req, res, next) {
  try {
    // TODO hacer que llegue como bool en zod
    const { soft } = req.query;
    const { id } = req.params;

    const deliveryNote = deliveryNote.findById(id);

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

// ASK Preguntar cómo se espera que funcionen los endpoints relaccionados al pdfkit
// TODO middleware para gestiornar el acceso al endpoint
export async function getPdfFromDeliveryNote(req, res, next){
    try {
        const {id} = req.params;
        
        const nota = deliveryNote.findById(id);
        
        req.file = nota;
        
        signPdf(req, res, next);
        
    } catch (error) {
        next(error)
    }
}