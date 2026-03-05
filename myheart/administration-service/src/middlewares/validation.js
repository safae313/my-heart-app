const Joi = require('joi');

const hopitalSchema = Joi.object({
    nom: Joi.string().max(200).required(),
    adresse: Joi.string().optional().allow(''),
    ville: Joi.string().optional().allow(''),
    code_postal: Joi.string().optional().allow(''),
    telephone: Joi.string().optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    type: Joi.string().valid('public','privé','clinique').optional(),
    actif: Joi.boolean().optional()
});

const departementSchema = Joi.object({
    nom: Joi.string().max(200).required(),
    description: Joi.string().optional().allow(''),
    hospital_id: Joi.number().integer().required(),
    chef_departement_id: Joi.number().integer().optional(),
    actif: Joi.boolean().optional()
});

const serviceSchema = Joi.object({
    nom: Joi.string().max(200).required(),
    description: Joi.string().optional().allow(''),
    departement_id: Joi.number().integer().required(),
    responsable_id: Joi.number().integer().optional(),
    actif: Joi.boolean().optional()
});

const permissionSchema = Joi.object({ role: Joi.string().required(), permission: Joi.string().required(), description: Joi.string().optional().allow('') });

const configUpsertSchema = Joi.object({ key: Joi.string().required(), value: Joi.any().required() });

const validate = (schema) => (req,res,next)=>{
    const { error, value } = schema.validate(req.body, { abortEarly:false, stripUnknown:true });
    if (error){ const errors = error.details.map(d=>({field:d.path.join('.'), message:d.message})); return res.status(400).json({success:false,message:'Validation error', errors}); }
    req.body = value; next();
};

module.exports = { validate, hopitalSchema, departementSchema, serviceSchema, permissionSchema, configUpsertSchema };