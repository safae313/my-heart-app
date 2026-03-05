const Joi = require('joi');

const createDossierSchema = Joi.object({
    patient_id: Joi.number().integer().required(),
    patient_nom: Joi.string().optional().allow(''),
    patient_prenom: Joi.string().optional().allow(''),
    date_naissance: Joi.date().optional(),
    groupe_sanguin: Joi.string().valid('A+','A-','B+','B-','AB+','AB-','O+','O-').optional(),
    medecin_traitant_id: Joi.number().integer().optional(),
    notes_importantes: Joi.string().optional().allow(''),
    allergies: Joi.array().items(Joi.object({
        nom: Joi.string().required(),
        type: Joi.string().valid('médicament','aliment','autre').required(),
        gravite: Joi.string().valid('légère','modérée','sévère').required(),
        date_decouverte: Joi.date().optional(),
        notes: Joi.string().optional().allow('')
    })).optional(),
    traitements_en_cours: Joi.array().items(Joi.object({
        medicament_id: Joi.number().integer().required(),
        medicament_nom: Joi.string().required(),
        posologie: Joi.string().required(),
        date_debut: Joi.date().optional(),
        date_fin: Joi.date().optional(),
        prescripteur_id: Joi.number().integer().optional(),
        renouvelable: Joi.boolean().optional()
    })).optional(),
    consultations: Joi.array().items(Joi.object({
        date: Joi.date().optional(),
        medecin_id: Joi.number().integer().optional(),
        medecin_nom: Joi.string().optional().allow(''),
        hospital_id: Joi.number().integer().optional(),
        motif: Joi.string().optional().allow(''),
        diagnostic: Joi.string().optional().allow(''),
        notes: Joi.string().optional().allow(''),
        ordonnance_id: Joi.number().integer().optional(),
        analyse_ids: Joi.array().items(Joi.number().integer()).optional()
    })).optional(),
    vaccinations: Joi.array().items(Joi.object({
        nom: Joi.string().required(),
        date: Joi.date().required(),
        rappel: Joi.date().optional(),
        administrateur: Joi.string().optional().allow('')
    })).optional(),
    antecedents: Joi.array().items(Joi.object({
        type: Joi.string().required(),
        description: Joi.string().optional().allow(''),
        date: Joi.date().optional()
    })).optional()
});

const updateDossierSchema = createDossierSchema; // same structure for simplicity

// subschemas
const allergieSchema = Joi.object({
    nom: Joi.string().required(),
    type: Joi.string().valid('médicament','aliment','autre').required(),
    gravite: Joi.string().valid('légère','modérée','sévère').required(),
    date_decouverte: Joi.date().optional(),
    notes: Joi.string().optional().allow('')
});

const traitementSchema = Joi.object({
    medicament_id: Joi.number().integer().required(),
    medicament_nom: Joi.string().required(),
    posologie: Joi.string().required(),
    date_debut: Joi.date().optional(),
    date_fin: Joi.date().optional(),
    prescripteur_id: Joi.number().integer().optional(),
    renouvelable: Joi.boolean().optional()
});

const consultationSchema = Joi.object({
    date: Joi.date().optional(),
    medecin_id: Joi.number().integer().optional(),
    medecin_nom: Joi.string().optional().allow(''),
    hospital_id: Joi.number().integer().optional(),
    motif: Joi.string().optional().allow(''),
    diagnostic: Joi.string().optional().allow(''),
    notes: Joi.string().optional().allow(''),
    ordonnance_id: Joi.number().integer().optional(),
    analyse_ids: Joi.array().items(Joi.number().integer()).optional()
});

const vaccinationSchema = Joi.object({
    nom: Joi.string().required(),
    date: Joi.date().required(),
    rappel: Joi.date().optional(),
    administrateur: Joi.string().optional().allow('')
});

module.exports = {
    createDossierSchema,
    updateDossierSchema,
    allergieSchema,
    traitementSchema,
    consultationSchema,
    vaccinationSchema
};