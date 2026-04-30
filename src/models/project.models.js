import mongoose from "mongoose";
import { softDeletePlugin } from "../plugins/softDelete.plugin.js";

const projectSchema = new mongoose.Schema({
  // ref: 'User' — usuario que lo creó
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
  // ref: 'Client' — cliente asociado
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  name: {
    type: String,
    required: true,
  }, // Nombre del proyecto
  projectCode: {
    type: String,
    sparse: true,
  }, // Código interno único (generado automáticamente)
  address: {
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String,
  },
  email: {
    type: String,
    required: true,
  }, // Email de contacto del proyecto
  notes: String, // Notas adicionales
  active: Boolean,
});

async function generateProjectCode() {
  // Solo generar si es un documento nuevo y no tiene projectCode
  if (this.isNew && !this.projectCode) {
    let isUnique = false;

    // si no es único y es nuevo entra
    while (!isUnique && this.isNew) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const projectCode = `PRJ-${timestamp}-${random}`;

      // Verificar que sea único
      const existing = await mongoose.model("Project").findOne({ projectCode });

      if (!existing) {
        this.projectCode = projectCode;
        isUnique = true;
      }
    }
  }
}
// Middleware pre-save para generar automáticamente el projectCode
projectSchema.pre("save", generateProjectCode);
projectSchema.index({ company: 1, projectCode: 1 }, { unique: true, sparse: true });
projectSchema.index({ company: 1, email: 1 }, { unique: true });
projectSchema.plugin(softDeletePlugin);

const Project = mongoose.model("Project", projectSchema);
export default Project;
