const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { validate } = require('../middlewares/validation');
const { checkRole } = require('../middlewares/auth');
const { 
    createAppointmentSchema, 
    updateStatusSchema,
    cancelAppointmentSchema,
    checkAvailabilitySchema 
} = require('../middlewares/validation');

// ==================== ROUTES PUBLIQUES (mais authentifiées) ====================
// Toutes les routes nécessitent un token JWT (appliqué dans app.js)

// ==================== ROUTES POUR LES PATIENTS ====================

/**
 * @route   POST /api/appointments
 * @desc    Créer un nouveau rendez-vous
 * @access  Patient, Médecin, Admin
 */
router.post(
    '/',
    validate(createAppointmentSchema),
    appointmentController.createAppointment
);

/**
 * @route   GET /api/appointments/patient/mes-rendez-vous
 * @desc    Récupérer les rendez-vous du patient connecté
 * @access  Patient
 */
router.get(
    '/patient/mes-rendez-vous',
    checkRole(['patient']),
    appointmentController.getMyPatientAppointments
);

/**
 * @route   POST /api/appointments/:id/cancel
 * @desc    Annuler un rendez-vous
 * @access  Patient (ses propres RDV), Médecin (ses propres RDV), Admin
 */
router.post(
    '/:id/cancel',
    validate(cancelAppointmentSchema),
    appointmentController.cancelAppointment
);

// ==================== ROUTES POUR LES MÉDECINS ====================

/**
 * @route   GET /api/appointments/medecin/mes-rendez-vous
 * @desc    Récupérer les rendez-vous du médecin connecté
 * @access  Médecin
 */
router.get(
    '/medecin/mes-rendez-vous',
    checkRole(['medecin']),
    appointmentController.getMyMedecinAppointments
);

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Mettre à jour le statut d'un rendez-vous
 * @access  Médecin (ses propres RDV), Admin
 */
router.patch(
    '/:id/status',
    validate(updateStatusSchema),
    appointmentController.updateAppointmentStatus
);

// ==================== ROUTES POUR LES DEUX (PATIENT/MÉDECIN) ====================

/**
 * @route   POST /api/appointments/check-availability
 * @desc    Vérifier si un créneau est disponible
 * @access  Patient, Médecin, Admin
 */
router.post(
    '/check-availability',
    validate(checkAvailabilitySchema),
    appointmentController.checkAvailability
);

/**
 * @route   GET /api/appointments/available-slots
 * @desc    Obtenir les créneaux disponibles d'un médecin
 * @access  Patient, Médecin, Admin
 */
router.get(
    '/available-slots',
    appointmentController.getAvailableSlots
);

/**
 * @route   GET /api/appointments/:id
 * @desc    Récupérer un rendez-vous par son ID
 * @access  Patient (ses propres RDV), Médecin (ses propres RDV), Admin
 */
router.get(
    '/:id',
    appointmentController.getAppointmentById
);

// ==================== ROUTES POUR ADMIN SEULEMENT ====================

/**
 * @route   GET /api/appointments/patient/:patientId
 * @desc    Récupérer les rendez-vous d'un patient spécifique
 * @access  Admin seulement
 */
router.get(
    '/patient/:patientId',
    checkRole(['admin']),
    appointmentController.getPatientAppointments
);

/**
 * @route   GET /api/appointments/medecin/:medecinId
 * @desc    Récupérer les rendez-vous d'un médecin spécifique
 * @access  Admin seulement
 */
router.get(
    '/medecin/:medecinId',
    checkRole(['admin']),
    appointmentController.getMedecinAppointments
);

/**
 * @route   GET /api/appointments/stats
 * @desc    Obtenir des statistiques sur les rendez-vous
 * @access  Admin seulement
 */
router.get(
    '/stats',
    checkRole(['admin']),
    appointmentController.getStats
);

module.exports = router;