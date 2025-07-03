const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingrese su nombre'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Por favor ingrese su email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Por favor ingrese un email válido']
  },
  password: {
    type: String,
    required: [true, 'Por favor ingrese una contraseña'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'instructor', 'aprendiz', 'staff'],
    default: 'aprendiz'
  },
  document: {
    type: String,
    required: [true, 'Por favor ingrese su número de documento'],
    unique: true
  },
  program: {
    type: String,
    required: function() {
      return this.role === 'aprendiz';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generar token JWT
userSchema.methods.generateAuthToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Comparar contraseñas
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);