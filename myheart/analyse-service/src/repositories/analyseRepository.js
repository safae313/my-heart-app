const Analyse = require('../models/Analyse');

class AnalyseRepository {
    async create(data) {
        const analyse = new Analyse(data);
        return await analyse.save();
    }

    async findById(id) {
        return await Analyse.findById(id);
    }

    async findByPatientId(patientId) {
        return await Analyse.find({ patient_id: patientId }).sort({ date_prescription: -1 });
    }

    async findPendingForLabo() {
        return await Analyse.find({ statut: 'en_attente' });
    }

    async updateResults(id, updates) {
        return await Analyse.findByIdAndUpdate(id, updates, { new: true });
    }

    async updateStatut(id, statut) {
        return await Analyse.findByIdAndUpdate(id, { statut }, { new: true });
    }

    async addDocument(id, document) {
        return await Analyse.findByIdAndUpdate(
            id,
            { $push: { documents: document } },
            { new: true }
        );
    }

    async stats() {
        return await Analyse.aggregate([
            { $group: { _id: '$statut', count: { $sum: 1 } } }
        ]);
    }
}

module.exports = new AnalyseRepository();