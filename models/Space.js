const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingrese el nombre del espacio'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Por favor ingrese una descripción']
  },
  capacity: {
    type: Number,
    required: [true, 'Por favor ingrese la capacidad']
  },
  type: {
    type: String,
    enum: ['aula', 'laboratorio', 'sala_tic', 'auditorio', 'zona_reunion', 'otro'],
    required: [true, 'Por favor seleccione el tipo de espacio']
  },
  location: {
    building: {
      type: String,
      required: [true, 'Por favor ingrese el edificio']
    },
    floor: {
      type: Number,
      required: [true, 'Por favor ingrese el piso']
    }
  },
  equipment: [{
    name: {
      type: String,
      required: [true, 'Por favor ingrese el nombre del equipo']
    },
    quantity: {
      type: Number,
      default: 1
    },
    description: {
      type: String
    }
  }],
  availability: {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }]
  },
  status: {
    type: String,
    enum: ['available', 'maintenance', 'unavailable'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Space', spaceSchema);