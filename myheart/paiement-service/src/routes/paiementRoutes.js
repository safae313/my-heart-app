const express = require('express');
const router = express.Router();
const factureCtrl = require('../controllers/factureController');
const paiementCtrl = require('../controllers/paiementController');
const remboursementCtrl = require('../controllers/remboursementController');
const webhookCtrl = require('../controllers/webhookController');
const statistiqueCtrl = require('../controllers/statistiqueController');

const { authenticateToken, requireRoles } = require('../middlewares/auth');
const { createLimiter } = require('../middlewares/rateLimit');
const idempotency = require('../middlewares/idempotency');
const { validate, factureSchema, statutSchema, paiementSchema, remboursementSchema } = require('../middlewares/validation');

// facts
router.post('/factures', authenticateToken, requireRoles(['admin','medecin']), validate(factureSchema), factureCtrl.create);
router.get('/factures/patient/:patientId', authenticateToken, requireRoles(['patient','admin']), factureCtrl.listByPatient);
router.get('/factures/:id', authenticateToken, factureCtrl.get);
router.patch('/factures/:id/statut', authenticateToken, requireRoles(['admin']), validate(statutSchema), factureCtrl.updateStatut);
router.get('/factures/:id/pdf', authenticateToken, factureCtrl.pdf);

// paiements
router.post('/payer', authenticateToken, idempotency, createLimiter(15*60*1000,100), validate(paiementSchema), paiementCtrl.pay);
router.get('/patient/:patientId/historique', authenticateToken, requireRoles(['patient','admin']), paiementCtrl.history);
router.get('/:id/statut', authenticateToken, paiementCtrl.status);

// remboursements
router.post('/:id/remboursement', authenticateToken, requireRoles(['patient','admin']), validate(remboursementSchema), remboursementCtrl.request);
router.patch('/remboursements/:id', authenticateToken, requireRoles(['admin']), remboursementCtrl.process);
router.get('/patient/:patientId/remboursements', authenticateToken, requireRoles(['patient','admin']), remboursementCtrl.history);

// webhooks
router.post('/webhook/:prestataire', webhookCtrl.handle);

// stats
router.get('/stats', authenticateToken, requireRoles(['admin']), statistiqueCtrl.period);
router.get('/chiffre-affaires', authenticateToken, requireRoles(['admin']), statistiqueCtrl.chiffre);

module.exports = router;