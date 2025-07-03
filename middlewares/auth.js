const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');

// Proteger rutas
exports.protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return next(new ErrorResponse('No autorizado para acceder a esta ruta', 401));
  }
  
  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return next(new ErrorResponse('No se encontró usuario con este token', 404));
    }
    
    next();
  } catch (err) {
    return next(new ErrorResponse('No autorizado para acceder a esta ruta', 401));
  }
};

// Verificar roles
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`El rol ${req.user.role} no está autorizado para acceder a esta ruta`, 403)
      );
    }
    next();
  };
};