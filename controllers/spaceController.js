const Space = require('../models/Space');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Obtener todos los espacios
// @route   GET /api/spaces
// @access  Public
exports.getSpaces = asyncHandler(async (req, res, next) => {
  // Filtrar por tipo si se especifica
  let query;
  const reqQuery = { ...req.query };
  
  // Campos a excluir
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);
  
  // Filtros avanzados
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
  query = Space.find(JSON.parse(queryStr));
  
  // Seleccionar campos
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }
  
  // Ordenar
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('name');
  }
  
  // Paginación
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Space.countDocuments();
  
  query = query.skip(startIndex).limit(limit);
  
  // Ejecutar consulta
  const spaces = await query;
  
  // Resultado de paginación
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  
  res.status(200).json({
    success: true,
    count: spaces.length,
    pagination,
    data: spaces
  });
});

// @desc    Obtener un espacio
// @route   GET /api/spaces/:id
// @access  Public
exports.getSpace = asyncHandler(async (req, res, next) => {
  const space = await Space.findById(req.params.id);
  
  if (!space) {
    return next(new ErrorResponse(`Espacio no encontrado con id ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: space
  });
});

// @desc    Crear un espacio
// @route   POST /api/spaces
// @access  Private/Admin
exports.createSpace = asyncHandler(async (req, res, next) => {
  const space = await Space.create(req.body);
  
  res.status(201).json({
    success: true,
    data: space
  });
});

// @desc    Actualizar un espacio
// @route   PUT /api/spaces/:id
// @access  Private/Admin
exports.updateSpace = asyncHandler(async (req, res, next) => {
  const space = await Space.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!space) {
    return next(new ErrorResponse(`Espacio no encontrado con id ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: space
  });
});

// @desc    Eliminar un espacio
// @route   DELETE /api/spaces/:id
// @access  Private/Admin
exports.deleteSpace = asyncHandler(async (req, res, next) => {
  const space = await Space.findByIdAndDelete(req.params.id);
  
  if (!space) {
    return next(new ErrorResponse(`Espacio no encontrado con id ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Verificar disponibilidad de un espacio
// @route   GET /api/spaces/:id/availability
// @access  Public
exports.checkAvailability = asyncHandler(async (req, res, next) => {
  const { date, startTime, endTime } = req.query;
  
  if (!date || !startTime || !endTime) {
    return next(new ErrorResponse('Por favor proporcione fecha, hora de inicio y hora de fin', 400));
  }
  
  // Convertir a objetos Date
  const startDateTime = new Date(`${date}T${startTime}`);
  const endDateTime = new Date(`${date}T${endTime}`);
  
  // Verificar si el espacio existe
  const space = await Space.findById(req.params.id);
  if (!space) {
    return next(new ErrorResponse(`Espacio no encontrado con id ${req.params.id}`, 404));
  }
  
  // Verificar reservaciones existentes
  const existingReservations = await Reservation.find({
    space: req.params.id,
    $or: [
      {
        startTime: { $lt: endDateTime },
        endTime: { $gt: startDateTime }
      }
    ]
  });
  
  const isAvailable = existingReservations.length === 0;
  
  res.status(200).json({
    success: true,
    data: {
      available: isAvailable,
      conflictingReservations: existingReservations
    }
  });
});