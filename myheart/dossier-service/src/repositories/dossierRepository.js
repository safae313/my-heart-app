const Dossier = require('../models/Dossier');

const create = async (data) => {
    const dossier = new Dossier(data);
    return dossier.save();
};

const findByPatientId = async (patientId) => {
    return Dossier.findOne({ patient_id: patientId });
};

const updateByPatientId = async (patientId, update) => {
    return Dossier.findOneAndUpdate({ patient_id: patientId }, update, { new: true });
};

const deleteByPatientId = async (patientId) => {
    return Dossier.findOneAndDelete({ patient_id: patientId });
};

// push subdocuments
const addAllergie = async (patientId, allergie) => {
    return Dossier.findOneAndUpdate(
        { patient_id: patientId },
        { $push: { allergies: allergie } },
        { new: true }
    );
};

const addTraitement = async (patientId, traitement) => {
    return Dossier.findOneAndUpdate(
        { patient_id: patientId },
        { $push: { traitements_en_cours: traitement } },
        { new: true }
    );
};

const addConsultation = async (patientId, consultation) => {
    return Dossier.findOneAndUpdate(
        { patient_id: patientId },
        { $push: { consultations: consultation } },
        { new: true }
    );
};

const addVaccination = async (patientId, vaccination) => {
    return Dossier.findOneAndUpdate(
        { patient_id: patientId },
        { $push: { vaccinations: vaccination } },
        { new: true }
    );
};

module.exports = {
    create,
    findByPatientId,
    updateByPatientId,
    deleteByPatientId,
    addAllergie,
    addTraitement,
    addConsultation,
    addVaccination
};