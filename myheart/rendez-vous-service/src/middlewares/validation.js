const Joi = require('joi');

// ==================== SCHÉMAS DE VALIDATION ====================

// Schéma pour la création d'un rendez-vous
const createAppointmentSchema = Joi.object({
    patient_id: Joi.number().integer().required().messages({
        'number.base': 'L\'ID patient doit être un nombre',
        'any.required': 'L\'ID patient est requis'
    }),
    medecin_id: Joi.number().integer().required().messages({
        'number.base': 'L\'ID médecin doit être un nombre',
        'any.required': 'L\'ID médecin est requis'
    }),
    hospital_id: Joi.number().integer().required().messages({
        'number.base': 'L\'ID hôpital doit être un nombre',
        'any.required': 'L\'ID hôpital est requis'
    }),
    date_heure: Joi.date().iso().min('now').required().messages({
        'date.base': 'La date doit être valide',
        'date.min': 'La date ne peut pas être dans le passé',
        'any.required': 'La date est requise'
    }),
    motif: Joi.string().max(500).optional().allow(''),
    duree: Joi.number().integer().min(15).max(240).default(60)
});

// Schéma pour mise à jour du statut
const updateStatusSchema = Joi.object({
    statut: Joi.string().valid('en_attente', 'confirmé', 'annulé', 'terminé').required().messages({
        'any.only': 'Statut invalide. Valeurs autorisées: en_attente, confirmé, annulé, terminé',
        'any.required': 'Le statut est requis'
    })
});

// Schéma pour annulation
const cancelAppointmentSchema = Joi.object({
    reason: Joi.string().max(500).optional().allow('')
});

// Schéma pour vérifier disponibilité
const checkAvailabilitySchema = Joi.object({
    medecin_id: Joi.number().integer().required(),
    date_heure: Joi.date().iso().min('now').required(),
    duree: Joi.number().integer().min(15).max(240).default(60)
});

// Schéma pour les filtres de recherche
const appointmentFiltersSchema = Joi.object({
    statut: Joi.string().valid('en_attente', 'confirmé', 'annulé', 'terminé').optional(),
    date_debut: Joi.date().iso().optional(),
    date_fin: Joi.date().iso().min(Joi.ref('date_debut')).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
});

/**
 * Middleware de validation générique
 * @param {Joi.Schema} schema - Le schéma Joi à utiliser
 */
const validate = (schema) => {
    return (req, res, next) => {
        // Valider les données (corps de la requête)
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Montrer toutes les erreurs
            stripUnknown: true // Enlever les champs non définis
        });
        
        if (error) {
            // Formater les erreurs pour les rendre plus lisibles
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Erreur de validation',
                errors: errors
            });
        }
        
        // Remplacer req.body par les valeurs validées (et nettoyées)
        req.body = value;
        next();
    };
};

/**
 * Valider les paramètres de requête (query string)
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });
        
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Erreur de validation des paramètres',
                errors: errors
            });
        }
        
        req.query = value;
        next();
    };
};

module.exports = {
    validate,
    validateQuery,
    createAppointmentSchema,
    updateStatusSchema,
    cancelAppointmentSchema,
    checkAvailabilitySchema,
    appointmentFiltersSchema
};