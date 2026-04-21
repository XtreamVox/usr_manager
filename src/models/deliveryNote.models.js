import mongoose from "mongoose";
import { softDeletePlugin} from "../plugins/softDelete.plugin.js";

// TODO Optimizar esquema
const deliveryNoteSchema = new mongoose.Schema({
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
  format: "material" | "hours", // Tipo de albarán
  description: String,
  workDate: Date, // Fecha del trabajo
  // Para format: 'material'
  material: String,
  quantity: Number,
  unit: String,
  // Para format: 'hours'
  hours: Number,
  workers: [
    {
      // Múltiples trabajadores (opcional)
      name: String,
      hours: Number,
    },
  ],
  // Firma
  signed: Boolean,
  signedAt: Date,
  signatureUrl: String, // URL de la imagen de firma (Cloudinary/R2)
  pdfUrl: String, // URL del PDF firmado en la nube
}, { timestamps: true});

deliveryNoteSchema.plugin(softDeletePlugin);

const DeliveryNote = mongoose.model('DeliveryNote', deliveryNoteSchema);

export default DeliveryNote;