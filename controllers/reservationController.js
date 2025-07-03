const Reservation = require('../models/Reservation');
const Space = require('../models/Space');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Obtener todas las reservaciones
// @route   GET /api/reservations
// @access  Private/Admin
exports.getReservations = asyncHandler(async (req, res, next) => {
  let query;
  
  // Si no es admin, solo mostrar las reservaciones del usuario
  if (req.user.role !== 'admin') {
    query = Reservation.find({ user: req.user.id });
  } else {
    query = Reservation.find();
  }
  
  const reservations = await query;
  
  res.status(200).json({
    success: true,
    count: reservations.length,
    data: reservations
  });
});

// @desc    Obtener una reservación
// @route   GET /api/reservations/:id
// @access  Private
exports.getReservation = asyncHandler(async (req, res, next) => {
  const reservation = await Reservation.findById(req.params.id);
  
  if (!reservation) {
    return next(new ErrorResponse(`Reservación no encontrada con id ${req.params.id}`, 404));
  }
  
  // Asegurarse de que el usuario es el dueño o es admin
  if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('No autorizado para acceder a esta reservación', 401));
  }
  
  res.status(200).json({
    success: true,
    data: reservation
  });
});

// @desc    Crear una reservación
// @route   POST /api/reservations
// @access  Private
exports.createReservation = asyncHandler(async (req, res, next) => {
  // Verificar que el espacio existe
  const space = await Space.findById(req.body.space);
  if (!space) {
    return next(new ErrorResponse(`Espacio no encontrado con id ${req.body.space}`, 404));
  }
  
  // Verificar disponibilidad
  const existingReservations = await Reservation.find({
    space: req.body.space,
    $or: [
      {
        startTime: { $lt: req.body.endTime },
        endTime: { $gt: req.body.startTime }
      }
    ]
  });
  
  if (existingReservations.length > 0) {
    return next(new ErrorResponse('El espacio no está disponible en el horario solicitado', 400));
  }
  
  // Crear reservación
  const reservation = await Reservation.create({
    ...req.body,
    user: req.user.id
  });
  
  res.status(201).json({
    success: true,
    data: reservation
  });
});

// @desc    Actualizar una reservación
// @route   PUT /api/reservations/:id
// @access  Private
exports.updateReservation = asyncHandler(async (req, res, next) => {
  let reservation = await Reservation.findById(req.params.id);
  
  if (!reservation) {
    return next(new ErrorResponse(`Reservación no encontrada con id ${req.params.id}`, 404));
  }
  
  // Asegurarse de que el usuario es el dueño o es admin
  if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('No autorizado para actualizar esta reservación', 401));
  }
  
  // Si es admin, puede cambiar el estado
  if (req.user.role === 'admin' && req.body.status) {
    reservation.status = req.body.status;
    await reservation.save();
    return res.status(200).json({
      success: true,
      data: reservation
    });
  }
  
  // Verificar disponibilidad si se cambia el horario
  if (req.body.startTime || req.body.endTime) {
    const startTime = req.body.startTime || reservation.startTime;
    const endTime = req.body.endTime || reservation.endTime;
    
    const existingReservations = await Reservation.find({
      space: reservation.space,
      _id: { $ne: reservation._id },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });
    
    if (existingReservations.length > 0) {
      return next(new ErrorResponse('El espacio no está disponible en el nuevo horario solicitado', 400));
    }
  }
  
  // Actualizar reservación
  reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: reservation
  });
});

// @desc    Eliminar una reservación
// @route   DELETE /api/reservations/:id
// @access  Private
exports.deleteReservation = asyncHandler(async (req, res, next) => {
  const reservation = await Reservation.findById(req.params.id);
  
  if (!reservation) {
    return next(new ErrorResponse(`Reservación no encontrada con id ${req.params.id}`, 404));
  }
  
  // Asegurarse de que el usuario es el dueño o es admin
  if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('No autorizado para eliminar esta reservación', 401));
  }
  
  await reservation.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Obtener reservaciones por espacio
// @route   GET /api/spaces/:spaceId/reservations
// @access  Public
exports.getReservationsBySpace = asyncHandler(async (req, res, next) => {
  const reservations = await Reservation.find({ space: req.params.spaceId });
  
  res.status(200).json({
    success: true,
    count: reservations.length,
    data: reservations
  });
});

// @desc    Obtener reservaciones por usuario
// @route   GET /api/users/:userId/reservations
// @access  Private/Admin
exports.getReservationsByUser = asyncHandler(async (req, res, next) => {
  // Solo admin puede ver reservaciones de otros usuarios
  if (req.user.role !== 'admin' && req.params.userId !== req.user.id) {
    return next(new ErrorResponse('No autorizado para ver estas reservaciones', 401));
  }
  
  const reservations = await Reservation.find({ user: req.params.userId });
  
  res.status(200).json({
    success: true,
    count: reservations.length,
    data: reservations
  });
});