import mongoose from "mongoose";
import { softDeletePlugin } from "../plugins/softDelete.plugin.js";

const deliveryNoteSchema = new mongoose.Schema(
  {
    // ref: 'User' — usuario que crea
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // ref: 'Company' — compañía a la que pertenece
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    // ref: 'Client'
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    // ref: 'Project'
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    format: {
      type: String,
      enum: ["material", "hours"],
      required: true,
    }, // Tipo de albarán
    description: String,
    workDate: Date, // Fecha del trabajo
    // Para format: 'material'
    material: {
      type: {
        unit: String,
        data: [
          {
            name: String,
            quantity: Number,
          },
        ],
      },
      required: function () {
        return this.format === "material";
      },
    },
    // Para format: 'hours'
    workers: {
      type: {
        hours: Number,
        data: [
          {
            name: String,
            hours: Number,
          },
        ],
      },
      required: function () {
        return this.format === "hours";
      },
    },
    // Firma
    signed: {
      type: Boolean,
      default: false,
    },
    signedAt: Date,
    signatureUrl: String, // URL de la imagen de firma (Cloudinary/R2)
    pdfUrl: String, // URL del PDF firmado en la nube
  },
  { timestamps: true },
);

deliveryNoteSchema.plugin(softDeletePlugin);

deliveryNoteSchema.index({ format: 1, workDate: -1 });
deliveryNoteSchema.index({ user: 1 });


const DeliveryNote = mongoose.model("DeliveryNote", deliveryNoteSchema);

export default DeliveryNote;
