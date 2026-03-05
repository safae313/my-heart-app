const Joi = require('joi');

const registerSchema = Joi.object({
  nom: Joi.string().min(2).max(50).required(),
  prenom: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  motDePasse: Joi.string().min(6).required(),
  telephone: Joi.string().min(8).max(15).required()
});

const createStaffSchema = Joi.object({
  nom: Joi.string().min(2).max(50).required(),
  prenom: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  motDePasse: Joi.string().min(6).required(),
  telephone: Joi.string().min(8).max(15).required(),
  role: Joi.string().valid('medecin', 'pharmacien', 'laborantin', 'admin').required(),
  hospital_id: Joi.number().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  motDePasse: Joi.string().min(6).required()
});

module.exports = { registerSchema, createStaffSchema, loginSchema };