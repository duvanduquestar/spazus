const express = require('express');
const router = express.Router();
const spaceController = require('../controllers/spaceController');
const auth = require('../middlewares/auth');
const { checkRole } = require('../middlewares/auth');

// @route   GET api/spaces
// @desc    Obtener todos los espacios
// @access  Public
router.get('/', spaceController.getSpaces);

// @route   GET api/spaces/:id
// @desc    Obtener un espacio
// @access  Public
router.get('/:id', spaceController.getSpace);

// @route   GET api/spaces/:id/availability
// @desc    Verificar disponibilidad de un espacio
// @access  Public
router.get('/:id/availability', spaceController.checkAvailability);

// @route   POST api/spaces
// @desc    Crear un espacio
// @access  Private/Admin
router.post('/', auth, checkRole(['admin']), spaceController.createSpace);

// @route   PUT api/spaces/:id
// @desc    Actualizar un espacio
// @access  Private/Admin
router.put('/:id', auth, checkRole(['admin']), spaceController.updateSpace);

// @route   DELETE api/spaces/:id
// @desc    Eliminar un espacio
// @access  Private/Admin
router.delete('/:id', auth, checkRole(['admin']), spaceController.deleteSpace);

// @route   GET api/spaces/:spaceId/reservations
// @desc    Obtener reservaciones por espacio
// @access  Public
router.get('/:spaceId/reservations', spaceController.getReservationsBySpace);

module.exports = router;