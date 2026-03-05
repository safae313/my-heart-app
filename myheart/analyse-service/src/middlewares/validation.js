const Joi = require('joi');
const { TestCategory, Interpretation, DocumentType, AnalyseStatus } = require('../utils/constants');

const createAnalyseSchema = Joi.object({
    patient_id: Joi.number().integer().required(),
    medecin_prescripteur_id: Joi.number().integer().required(),
    date_prelevement: Joi.date().iso().optional(),
    laboratoire_id: Joi.number().integer().optional(),
    laboratoire_nom: Joi.string().optional().allow(''),
    hospital_id: Joi.number().integer().optional(),
    tests: Joi.array().items(
        Joi.object({
            code: Joi.string().optional().allow(''),
            nom: Joi.string().optional().allow(''),
            categorie: Joi.string().valid(...Object.values(TestCategory)).optional(),
            echantillon_id: Joi.string().optional().allow(''),
            resultat: Joi.any().optional(),
            unite: Joi.string().optional().allow(''),
            valeur_normale: Joi.string().optional().allow(''),
            interpretation: Joi.string().valid(...Object.values(Interpretation)).optional(),
            commentaire: Joi.string().optional().allow(''),
            realise_par: Joi.number().integer().optional(),
            realise_le: Joi.date().iso().optional()
        })
    ).optional(),
    documents: Joi.array().items(
        Joi.object({
            nom: Joi.string().optional().allow(''),
            url: Joi.string().uri().optional(),
            type: Joi.string().valid(...Object.values(DocumentType)).optional()
        })
    ).optional(),
    notes: Joi.string().optional().allow('')
});

const updateResultSchema = Joi.object({
    date_resultats: Joi.date().iso().optional(),
    tests: Joi.array().items(
        Joi.object({
            _id: Joi.string().required(),
            resultat: Joi.any().optional(),
            interpretation: Joi.string().valid(...Object.values(Interpretation)).optional(),
            commentaire: Joi.string().optional().allow(''),
            realise_par: Joi.number().integer().optional(),
            realise_le: Joi.date().iso().optional()
        })
    ).required()
});

const updateStatutSchema = Joi.object({
    statut: Joi.string().valid(...Object.values(AnalyseStatus)).required()
});

const addDocumentSchema = Joi.object({
    nom: Joi.string().required(),
    url: Joi.string().uri().required(),
    type: Joi.string().valid(...Object.values(DocumentType)).required()
});

const validate = schema => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        const errors = error.details.map(d => ({ field: d.path.join('.'), message: d.message }));
        return res.status(400).json({ success: false, message: 'Erreur de validation', errors });
    }
    req.body = value;
    next();
};

module.exports = { validate, createAnalyseSchema, updateResultSchema, updateStatutSchema, addDocumentSchema };