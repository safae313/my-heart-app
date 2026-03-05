const express = require('express');
const router = express.Router();
const ordonnanceController = require('../controllers/ordonnanceController');
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { validate, createOrdonnanceSchema, updateStatutSchema, addPrescriptionSchema } = require('../middlewares/validation');
const { UserRole } = require('../utils/constants');

// toutes les routes nécessitent un token
router.use(authenticateToken);

router.post('/', validate(createOrdonnanceSchema), ordonnanceController.createOrdonnance);
router.get('/:id', ordonnanceController.getOrdonnanceById);
router.get('/patient/:patientId', ordonnanceController.getOrdonnancesByPatient);
router.get('/medecin/:medecinId', ordonnanceController.getOrdonnancesByMedecin);
router.patch('/:id/statut', validate(updateStatutSchema), ordonnanceController.updateStatut);
router.post('/:id/prescriptions', validate(addPrescriptionSchema), ordonnanceController.addPrescription);
router.delete('/:id', checkRole([UserRole.ADMIN]), ordonnanceController.deleteOrdonnance);
router.post('/:id/valider', checkRole([UserRole.PHARMACIEN, UserRole.ADMIN]), ordonnanceController.validateEnPharmacie);

module.exports = router;