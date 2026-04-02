import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
    email: String,             // Único (index: unique), validado con Zod
    password: String,          // Cifrada con bcrypt
    name: String,              // Nombre
    lastName: String,          // Apellidos
    nif: String,               // Documento de identidad
    role: 'admin' | 'guest',            // Por defecto: 'admin'
    status: 'pending' | 'verified' | 'blocked',     // Estado de verificación del email (index)
    verificationCode: String,  // Código aleatorio de 6 dígitos
    verifibcationAttempts: {type: Number, default : 3}, // por defecto 3, se decrementa en cada intento y al acertar se resetea a 3
    company: ObjectId,         // ref: 'Company' — se asigna en el onboarding (index)
    address: {
        street: String,
        number: String,
        postal: String,
        city: String,
        province: String
    },
    deleted: {type: Boolean, default: false},          // Soft delete
    createdAt: Date,
    updatedAt: Date
}
// Virtual (no se almacena, se calcula):
// fullName → name + ' ' + lastName
)

const User = mongoose.model('User', userSchema);

export default User;