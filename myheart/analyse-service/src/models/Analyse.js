const mongoose = require('mongoose');
const { AnalyseStatus, TestCategory, Interpretation, DocumentType } = require('../utils/constants');

const TestSchema = new mongoose.Schema({
    code: String,
    nom: String,
    categorie: { type: String, enum: Object.values(TestCategory) },
    echantillon_id: String,
    resultat: mongoose.Schema.Types.Mixed,
    unite: String,
    valeur_normale: String,
    interpretation: { type: String, enum: Object.values(Interpretation) },
    commentaire: String,
    realise_par: Number,
    realise_le: Date
});

const DocumentSchema = new mongoose.Schema({
    nom: String,
    url: String,
    type: { type: String, enum: Object.values(DocumentType) }
});

const AnalyseSchema = new mongoose.Schema({
    patient_id: { type: Number, required: true, index: true },
    medecin_prescripteur_id: { type: Number, required: true },
    date_prescription: { type: Date, default: Date.now, index: true },
    date_prelevement: Date,
    date_resultats: Date,
    statut: { type: String, enum: Object.values(AnalyseStatus), default: AnalyseStatus.EN_ATTENTE, index: true },
    laboratoire_id: { type: Number, index: true },
    laboratoire_nom: String,
    hospital_id: Number,
    tests: [TestSchema],
    documents: [DocumentSchema],
    notes: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

AnalyseSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Analyse', AnalyseSchema);