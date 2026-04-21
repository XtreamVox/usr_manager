import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  // ref: 'User' — usuario que lo creó
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
  },       
  // ref: 'Company' — compañía a la que pertenece   
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },       
  name: String,            // Nombre del cliente
  cif: String,             // CIF/NIF del cliente
  email: String,
  phone: String,
  address: {
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String
  },
  deleted: Boolean,        // Soft delete
  createdAt: Date,
  updatedAt: Date
});

const Client = mongoose.model('Client', clientSchema);
export default Client;

