import mongoose from 'mongoose';
import { softDeletePlugin } from '../plugins/softDelete.plugin.js';

const clientSchema = new mongoose.Schema({
  // ref: 'User' — usuario que lo creó
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true
  },       
  // ref: 'Company' — compañía a la que pertenece   
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    unique: true,
    required: true
  },       
  name: String,            // Nombre del cliente
  cif: {
    type: String,
    required: true,
    unique: true
  },             // CIF/NIF del cliente
  email: {
    type: String,
    required: true,
    unique: true
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

clientSchema.plugin(softDeletePlugin);


clientSchema.index({ email: 1 }, { unique: true });
clientSchema.index({ cif: 1 }, { unique: true });

const Client = mongoose.model('Client', clientSchema);
export default Client;

