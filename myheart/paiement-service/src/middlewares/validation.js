const Joi = require('joi');
const { FactureStatus, PaiementStatus, RemboursementStatus } = require('../utils/constants');

const factureSchema = Joi.object({
    patient_id: Joi.number().integer().required(),
    consultation_id: Joi.number().integer().optional(),
    ordonnance_id: Joi.number().integer().optional(),
    analyse_id: Joi.number().integer().optional(),
    date_echeance: Joi.date().iso().optional(),
    montant_total: Joi.number().precision(2).required(),
    montant_remboursement: Joi.number().precision(2).optional(),
    reste_a_charge: Joi.number().precision(2).required(),
    description: Joi.string().optional().allow('')
});

const statutSchema = Joi.object({ statut: Joi.string().valid(...Object.values(FactureStatus)).required() });

const paiementSchema = Joi.object({
    facture_id: Joi.number().integer().required(),
    patient_id: Joi.number().integer().required(),
    montant: Joi.number().precision(2).required(),
    methode: Joi.string().required(),
    reference_transaction: Joi.string().optional().allow(''),
    metadata: Joi.object().optional()
});

const remboursementSchema = Joi.object({ montant: Joi.number().precision(2).required(), raison: Joi.string().optional().allow('') });

const config = Joke => {}; // placeholder

const validate = schema => (req,res,next)=>{
    const { error, value } = schema.validate(req.body, { abortEarly:false, stripUnknown:true });
    if(error){ const errors=error.details.map(d=>({field:d.path.join('.'),message:d.message})); return res.status(400).json({success:false,message:'Validation error',errors}); }
    req.body=value; next();
};

module.exports={validate, factureSchema, statutSchema, paiementSchema, remboursementSchema};