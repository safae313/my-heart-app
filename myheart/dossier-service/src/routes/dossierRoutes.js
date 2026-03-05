const express = require('express');
const router = express.Router();
const controller = require('../controllers/dossierController');
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const { createDossierSchema, updateDossierSchema, allergieSchema, traitementSchema, consultationSchema, vaccinationSchema } = require('../validators/dossierValidator');

// toutes les routes nécessitent un token
router.post('/', authenticateToken, checkRole(['admin','medecin']), validate(createDossierSchema), controller.createDossier);
router.get('/patient/:patientId', authenticateToken, checkRole(['admin','medecin','patient']), controller.getDossierByPatientId);
router.put('/patient/:patientId', authenticateToken, checkRole(['admin','medecin','patient']), validate(updateDossierSchema), controller.updateDossier);
router.delete('/patient/:patientId', authenticateToken, checkRole(['admin']), controller.deleteDossier);

router.post('/patient/:patientId/allergies', authenticateToken, checkRole(['admin','medecin','patient']), validate(allergieSchema), controller.addAllergie);
router.post('/patient/:patientId/traitements', authenticateToken, checkRole(['admin','medecin','patient']), validate(traitementSchema), controller.addTraitement);
router.post('/patient/:patientId/consultations', authenticateToken, checkRole(['admin','medecin','patient']), validate(consultationSchema), controller.addConsultation);
router.post('/patient/:patientId/vaccinations', authenticateToken, checkRole(['admin','medecin','patient']), validate(vaccinationSchema), controller.addVaccination);

module.exports = router;
