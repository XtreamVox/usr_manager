import mongoose from 'mongoose';
import { softDeletePlugin } from '../plugins/softDelete.plugin.js';

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
  cif: {
    type: String,
    required: true
  },             // CIF/NIF del cliente
  email: {
    type: String,
    required: true
  },
  phone: String,
  address: {
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String
  },
}, { timestamps: true});

clientSchema.index({ company: 1, cif: 1 }, { unique: true });
clientSchema.index({ company: 1, email: 1 }, { unique: true });

clientSchema.plugin(softDeletePlugin);

const Client = mongoose.model('Client', clientSchema);
export default Client;
