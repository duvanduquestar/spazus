const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middlewares/auth');

// @route   GET api/reservations
// @desc    Obtener todas las reservaciones
// @access  Private/Admin
router.get('/', auth, reservationController.getReservations);

// @route   GET api/reservations/:id
// @desc    Obtener una reservación
// @access  Private
router.get('/:id', auth, reservationController.getReservation);

// @route   POST api/reservations
// @desc    Crear una reservación
// @access  Private
router.post('/', auth, reservationController.createReservation);

// @route   PUT api/reservations/:id
// @desc    Actualizar una reservación
// @access  Private
router.put('/:id', auth, reservationController.updateReservation);

// @route   DELETE api/reservations/:id
// @desc    Eliminar una reservación
// @access  Private
router.delete('/:id', auth, reservationController.deleteReservation);

// @route   GET api/users/:userId/reservations
// @desc    Obtener reservaciones por usuario
// @access  Private/Admin
router.get('/users/:userId/reservations', auth, reservationController.getReservationsByUser);

module.exports = router;