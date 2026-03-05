const mongoose = require('mongoose');

const allergySchema = new mongoose.Schema({
    nom: { type: String, required: true },
    type: { type: String, enum: ['médicament', 'aliment', 'autre'], required: true },
    gravite: { type: String, enum: ['légère', 'modérée', 'sévère'], required: true },
    date_decouverte: { type: Date, default: Date.now },
    notes: { type: String }
});

const traitementSchema = new mongoose.Schema({
    medicament_id: { type: Number, required: true },
    medicament_nom: { type: String, required: true },
    posologie: { type: String, required: true },
    date_debut: { type: Date, default: Date.now },
    date_fin: { type: Date },
    prescripteur_id: { type: Number },
    renouvelable: { type: Boolean, default: false }
});

const consultationSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    medecin_id: { type: Number },
    medecin_nom: { type: String },
    hospital_id: { type: Number },
    motif: { type: String },
    diagnostic: { type: String },
    notes: { type: String },
    ordonnance_id: { type: Number },
    analyse_ids: [{ type: Number }]
});

const vaccinationSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    date: { type: Date, required: true },
    rappel: { type: Date },
    administrateur: { type: String }
});

const antecedentSchema = new mongoose.Schema({
    type: { type: String, required: true },
    description: { type: String },
    date: { type: Date }
});

const dossierSchema = new mongoose.Schema({
    patient_id: { type: Number, required: true, unique: true },
    patient_nom: { type: String },
    patient_prenom: { type: String },
    date_naissance: { type: Date },
    groupe_sanguin: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    allergies: [allergySchema],
    traitements_en_cours: [traitementSchema],
    consultations: [consultationSchema],
    vaccinations: [vaccinationSchema],
    antecedents: [antecedentSchema],
    medecin_traitant_id: { type: Number },
    notes_importantes: { type: String }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Dossier', dossierSchema);
