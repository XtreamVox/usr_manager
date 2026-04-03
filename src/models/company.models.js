import mongoose from "mongoose";
import { softDeletePlugin } from "../plugins/softDelete.plugin.js";

const companySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    }, // ref: 'User' — admin que creó la compañía
    name: {
      type: String,
      required: true,
    }, // Nombre de la empresa
    cif: {
      type: String,
      required: true,
      unique: true,
      index: true,
    }, // CIF de la empresa
    address: {
      street: String,
      number: String,
      postal: String,
      city: String,
      province: String,
    },
    logo: String, // URL del logo (imagen subida con Multer)
    isFreelance: {
      type: Boolean,
      default: false,
    }, // true si es autónomo (1 sola persona)
  },
  { timestamps: true },
);

companySchema.plugin(softDeletePlugin);

const Company = mongoose.model("Company", companySchema);

export default Company;
