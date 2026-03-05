const express = require('express');
const router = express.Router();

const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const auditLogger = require('../middlewares/auditLogger');

const hopitalController = require('../controllers/hopitalController');
const departementController = require('../controllers/departementController');
const serviceController = require('../controllers/serviceMedicalController');
const droitsController = require('../controllers/droitsController');
const auditController = require('../controllers/auditController');
const configController = require('../controllers/configController');

const { validate, hopitalSchema, departementSchema, serviceSchema, permissionSchema, configUpsertSchema } = require('../middlewares/validation');

// apply authentication + admin + audit globally for admin routes
router.use(authenticateToken, requireAdmin, auditLogger);

// hopitaux
router.post('/hopitaux', validate(hopitalSchema), hopitalController.create);
router.get('/hopitaux', hopitalController.list);
router.get('/hopitaux/:id', hopitalController.get);
router.put('/hopitaux/:id', validate(hopitalSchema), hopitalController.update);
router.delete('/hopitaux/:id', hopitalController.remove);
router.patch('/hopitaux/:id/activate', hopitalController.activate);
router.get('/hopitaux/:id/stats', hopitalController.stats);

// departements
router.post('/departements', validate(departementSchema), departementController.create);
router.get('/departements/hopital/:hospitalId', departementController.listByHospital);
router.get('/departements/:id', departementController.get);
router.put('/departements/:id', validate(departementSchema), departementController.update);
router.delete('/departements/:id', departementController.delete);
router.post('/departements/:id/assign-chief', departementController.assignChief);

// services medical
router.post('/services', validate(serviceSchema), serviceController.create);
router.get('/services/departement/:departementId', serviceController.listByDepartement);
router.get('/services/:id', serviceController.get);
router.put('/services/:id', validate(serviceSchema), serviceController.update);
router.delete('/services/:id', serviceController.delete);

// droits
router.get('/droits', droitsController.list);
router.post('/droits', validate(permissionSchema), droitsController.add);
router.get('/droits/:role', droitsController.byRole);

// audit
router.get('/audit', auditController.query);

// config
router.get('/config', configController.list);
router.post('/config', validate(configUpsertSchema), configController.upsert);

module.exports = router;