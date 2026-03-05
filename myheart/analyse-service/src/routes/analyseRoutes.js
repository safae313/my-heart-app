const express = require('express');
const router = express.Router();
const analyseController = require('../controllers/analyseController');
const { authenticateToken, checkRole } = require('../middlewares/auth');
const {
    validate,
    createAnalyseSchema,
    updateResultSchema,
    updateStatutSchema,
    addDocumentSchema
} = require('../middlewares/validation');

// POST /api/analyses/ prescrire (médecin)
router.post('/', authenticateToken, checkRole(['medecin','admin']), validate(createAnalyseSchema), analyseController.prescrire);

// GET /api/analyses/patient/:patientId
router.get('/patient/:patientId', authenticateToken, checkRole(['patient','medecin','admin']), analyseController.listByPatient);

// GET /api/analyses/labo/en-attente
router.get('/labo/en-attente', authenticateToken, checkRole(['laborantin','admin']), analyseController.listPending);

// GET /api/analyses/:id
router.get('/:id', authenticateToken, analyseController.getById);

// PUT /api/analyses/:id/resultats
router.put('/:id/resultats', authenticateToken, checkRole(['laborantin','admin']), validate(updateResultSchema), analyseController.saisirResultats);

// PATCH /api/analyses/:id/statut
router.patch('/:id/statut', authenticateToken, checkRole(['laborantin','admin']), validate(updateStatutSchema), analyseController.changerStatut);

// POST /api/analyses/:id/documents
router.post('/:id/documents', authenticateToken, checkRole(['laborantin','admin']), validate(addDocumentSchema), analyseController.ajouterDocument);

// GET /api/analyses/stats
router.get('/stats', authenticateToken, checkRole(['admin']), analyseController.stats);

module.exports = router;