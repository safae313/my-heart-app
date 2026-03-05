const repository = require('../repositories/dossierRepository');

// Vérifie que l'utilisateur a le droit d'accéder/mutater un dossier
const _checkPermission = (user, patientId) => {
    if (user.role === 'admin') return true;
    if (user.role === 'patient' && user.id === Number(patientId)) return true;
    // médecins ou autres rôles peuvent consulter mais pas modifier peut-être
    if (user.role === 'medecin') return true; // on autorise consultation/ajout
    return false;
};

const createDossier = async (data, user) => {
    if (user.role !== 'admin' && user.role !== 'medecin') {
        throw { status: 403, message: 'Permission refusée' };
    }
    // la création ne doit pas exister
    const exists = await repository.findByPatientId(data.patient_id);
    if (exists) {
        throw { status: 400, message: 'Dossier déjà existant pour ce patient' };
    }
    return repository.create(data);
};

const getDossierByPatientId = async (patientId, user) => {
    if (!_checkPermission(user, patientId)) {
        throw { status: 403, message: 'Permission refusée' };
    }
    const dossier = await repository.findByPatientId(patientId);
    if (!dossier) {
        throw { status: 404, message: 'Dossier non trouvé' };
    }
    return dossier;
};

const updateDossier = async (patientId, update, user) => {
    if (!_checkPermission(user, patientId)) {
        throw { status: 403, message: 'Permission refusée' };
    }
    const dossier = await repository.updateByPatientId(patientId, update);
    if (!dossier) {
        throw { status: 404, message: 'Dossier non trouvé' };
    }
    return dossier;
};

const deleteDossier = async (patientId, user) => {
    if (user.role !== 'admin') {
        throw { status: 403, message: 'Seul un administrateur peut supprimer un dossier' };
    }
    const dossier = await repository.deleteByPatientId(patientId);
    if (!dossier) {
        throw { status: 404, message: 'Dossier non trouvé' };
    }
    return dossier;
};

const addAllergie = async (patientId, allergie, user) => {
    if (!_checkPermission(user, patientId)) {
        throw { status: 403, message: 'Permission refusée' };
    }
    const dossier = await repository.addAllergie(patientId, allergie);
    if (!dossier) throw { status: 404, message: 'Dossier non trouvé' };
    return dossier;
};

const addTraitement = async (patientId, traitement, user) => {
    if (!_checkPermission(user, patientId)) {
        throw { status: 403, message: 'Permission refusée' };
    }
    const dossier = await repository.addTraitement(patientId, traitement);
    if (!dossier) throw { status: 404, message: 'Dossier non trouvé' };
    return dossier;
};

const addConsultation = async (patientId, consultation, user) => {
    if (!_checkPermission(user, patientId)) {
        throw { status: 403, message: 'Permission refusée' };
    }
    const dossier = await repository.addConsultation(patientId, consultation);
    if (!dossier) throw { status: 404, message: 'Dossier non trouvé' };
    return dossier;
};

const addVaccination = async (patientId, vaccination, user) => {
    if (!_checkPermission(user, patientId)) {
        throw { status: 403, message: 'Permission refusée' };
    }
    const dossier = await repository.addVaccination(patientId, vaccination);
    if (!dossier) throw { status: 404, message: 'Dossier non trouvé' };
    return dossier;
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
