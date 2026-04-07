import mongoose from "mongoose";
import { softDeletePlugin } from "../plugins/softDelete.plugin.js";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      unique: true,
    }, // Único (index: unique), validado con Zod
    password: {
      type: String,
      required: true,
      select: false,
    }, // Cifrada con bcrypt
    name: String, // Nombre
    lastName: String, // Apellidos
    nif: String, // Documento de identidad
    role: {
      type: String,
      enum: ["admin", "guest"],
      default: "admin",
    },
    status: {
      type: String,
      enum: ["pending", "verified", "blocked"],
      default: "pending",
      index: true,
    },
    verificationCode: String, // Código aleatorio de 6 dígitos
    verificationAttempts: { type: Number, default: 3 }, // por defecto 3, se decrementa en cada intento y al acertar se resetea a 3
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      index: true,
    }, // ref: 'Company' — se asigna en el onboarding (index)
    address: {
      street: String,
      number: String,
      postal: String,
      city: String,
      province: String,
    },
  },
  { timestamps: true },
  // Virtual (no se almacena, se calcula):
  // fullName → name + ' ' + lastName
);

userSchema.virtual("fullName").get(function () {
  return this.name + " " + this.lastName;
});

userSchema.set("toJSON", { virtuals: true });
userSchema.plugin(softDeletePlugin);
userSchema.index({ email: 1, deleted: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

export default User;
