const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// @route   POST api/auth/register
// @desc    Registrar usuario
// @access  Public
router.post(
  '/register',
  [
    check('name', 'El nombre es requerido').not().isEmpty(),
    check('email', 'Por favor incluye un email válido').isEmail(),
    check('password', 'Por favor ingresa una contraseña con 6 o más caracteres').isLength({ min: 6 }),
    check('role', 'El rol es requerido').not().isEmpty(),
    check('document', 'El documento es requerido').not().isEmpty()
  ],
  authController.register
);

// @route   POST api/auth/login
// @desc    Iniciar sesión
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Por favor incluye un email válido').isEmail(),
    check('password', 'La contraseña es requerida').exists()
  ],
  authController.login
);

// @route   GET api/auth/me
// @desc    Obtener usuario actual
// @access  Private
router.get('/me', auth, authController.getMe);

module.exports = router;