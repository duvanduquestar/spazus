const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'La reservación debe pertenecer a un usuario']
  },
  space: {
    type: mongoose.Schema.ObjectId,
    ref: 'Space',
    required: [true, 'La reservación debe ser para un espacio']
  },
  startTime: {
    type: Date,
    required: [true, 'Por favor ingrese la hora de inicio']
  },
  endTime: {
    type: Date,
    required: [true, 'Por favor ingrese la hora de finalización'],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'La hora de finalización debe ser después de la hora de inicio'
    }
  },
  purpose: {
    type: String,
    required: [true, 'Por favor ingrese el propósito de la reservación'],
    enum: ['clase', 'reunion', 'evento', 'estudio', 'otro']
  },
  description: {
    type: String,
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres']
  },
  attendees: {
    type: Number,
    min: [1, 'Debe haber al menos un asistente']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para optimizar búsquedas
reservationSchema.index({ space: 1, startTime: 1, endTime: 1 });
reservationSchema.index({ user: 1 });

// Middleware para popular datos de usuario y espacio
reservationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email role'
  }).populate({
    path: 'space',
    select: 'name type capacity location'
  });
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);