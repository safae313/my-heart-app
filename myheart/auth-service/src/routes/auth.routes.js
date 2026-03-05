const express = require('express');
const router = express.Router();
const { register, createStaff, login, logout, me } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { registerSchema, createStaffSchema, loginSchema } = require('../validators/auth.validator');

router.post('/register', validate(registerSchema), register);
router.post('/create', verifyToken, checkRole('admin'), validate(createStaffSchema), createStaff);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', verifyToken, me);

module.exports = router;
