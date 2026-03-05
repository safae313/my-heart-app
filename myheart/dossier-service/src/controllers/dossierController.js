const service = require('../services/dossierService');

const createDossier = async (req, res, next) => {
    try {
        const dossier = await service.createDossier(req.body, req.user);
        res.status(201).json({ success: true, data: dossier });
    } catch (err) {
        next(err);
    }
};

const getDossierByPatientId = async (req, res, next) => {
    try {
        const dossier = await service.getDossierByPatientId(req.params.patientId, req.user);
        res.json({ success: true, data: dossier });
    } catch (err) {
        next(err);
    }
};

const updateDossier = async (req, res, next) => {
    try {
        const dossier = await service.updateDossier(req.params.patientId, req.body, req.user);
        res.json({ success: true, data: dossier });
    } catch (err) {
        next(err);
    }
};

const deleteDossier = async (req, res, next) => {
    try {
        const dossier = await service.deleteDossier(req.params.patientId, req.user);
        res.json({ success: true, data: dossier });
    } catch (err) {
        next(err);
    }
};

const addAllergie = async (req, res, next) => {
    try {
        const dossier = await service.addAllergie(req.params.patientId, req.body, req.user);
        res.status(201).json({ success: true, data: dossier });
    } catch (err) {
        next(err);
    }
};

const addTraitement = async (req, res, next) => {
    try {
        const dossier = await service.addTraitement(req.params.patientId, req.body, req.user);
        res.status(201).json({ success: true, data: dossier });
    } catch (err) {
        next(err);
    }
};

const addConsultation = async (req, res, next) => {
    try {
        const dossier = await service.addConsultation(req.params.patientId, req.body, req.user);
        res.status(201).json({ success: true, data: dossier });
    } catch (err) {
        next(err);
    }
};

const addVaccination = async (req, res, next) => {
    try {
        const dossier = await service.addVaccination(req.params.patientId, req.body, req.user);
        res.status(201).json({ success: true, data: dossier });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createDossier,
    getDossierByPatientId,
    updateDossier,
    deleteDossier,
    addAllergie,
    addTraitement,
    addConsultation,
    addVaccination
};