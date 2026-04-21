import mongoose from "mongoose";
import { required } from "zod/mini";

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
  name: String, // Nombre del proyecto
  projectCode: String, // Código interno único
  address: {
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String,
  },
  email: String, // Email de contacto del proyecto
  notes: String, // Notas adicionales
  active: Boolean,
  deleted: Boolean, // Soft delete
  createdAt: Date,
  updatedAt: Date,
});

const Project = mongoose.model("Project", projectSchema);
export default Project;
