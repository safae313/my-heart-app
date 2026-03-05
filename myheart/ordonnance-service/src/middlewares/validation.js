const Joi = require('joi');

// Schéma pour la création d'une ordonnance (avec prescriptions)
const createOrdonnanceSchema = Joi.object({
    patient_id: Joi.number().integer().required().messages({
        'number.base': 'L\'ID patient doit être un nombre',
        'any.required': 'L\'ID patient est requis'
    }),
    medecin_id: Joi.number().integer().required().messages({
        'number.base': 'L\'ID médecin doit être un nombre',
        'any.required': 'L\'ID médecin est requis'
    }),
    date_validite: Joi.date().iso().optional(),
    diagnostic: Joi.string().optional().allow(''),
    notes: Joi.string().optional().allow(''),
    prescriptions: Joi.array().items(
        Joi.object({
            medicament_id: Joi.number().integer().required(),
            medicament_nom: Joi.string().max(200).optional().allow(''),
            dosage: Joi.string().max(100).optional().allow(''),
            duree_traitement: Joi.string().max(100).optional().allow(''),
            posologie: Joi.string().optional().allow(''),
            quantite: Joi.number().integer().optional(),
            renouvelable: Joi.boolean().optional(),
            instructions: Joi.string().optional().allow('')
        })
    ).min(1).required().messages({
        'array.min': 'Au moins une prescription est requise'
    })
});

const updateStatutSchema = Joi.object({
    statut: Joi.string().valid('active', 'expirée', 'utilisée').required().messages({
        'any.only': 'Statut invalide. Valeurs autorisées: active, expirée, utilisée',
        'any.required': 'Le statut est requis'
    })
});

const addPrescriptionSchema = Joi.object({
    medicament_id: Joi.number().integer().required(),
    medicament_nom: Joi.string().max(200).optional().allow(''),
    dosage: Joi.string().max(100).optional().allow(''),
    duree_traitement: Joi.string().max(100).optional().allow(''),
    posologie: Joi.string().optional().allow(''),
    quantite: Joi.number().integer().optional(),
    renouvelable: Joi.boolean().optional(),
    instructions: Joi.string().optional().allow('')
});

// Middleware générique de validation
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const errors = error.details.map(d => ({ field: d.path.join('.'), message: d.message }));
            return res.status(400).json({ success: false, message: 'Erreur de validation', errors });
        }
        req.body = value;
        next();
    };
};

module.exports = {
    validate,
    createOrdonnanceSchema,
    updateStatutSchema,
    addPrescriptionSchema
};