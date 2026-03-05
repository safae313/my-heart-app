const factureRepo = require('../repositories/factureRepository');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const { pgPool } = require('../models/db');

class FactureService {
    async generate(data) {
        // ensure unique numero
        data.numero_facture = `FAC-${uuidv4()}`;
        data.reste_a_charge = data.montant_total - (data.montant_remboursement||0);
        const facture = await factureRepo.create(data);
        return facture;
    }

    async listByPatient(patientId) {
        return await factureRepo.findByPatient(patientId);
    }

    async get(id) {
        return await factureRepo.findById(id);
    }

    async updateStatus(id, statut) {
        return await factureRepo.updateStatut(id, statut);
    }

    async pdf(id) {
        const facture = await this.get(id);
        if (!facture) return null;
        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {});
        doc.text(`Facture #${facture.numero_facture}`);
        doc.text(`Patient ${facture.patient_id}`);
        doc.text(`Montant total: ${facture.montant_total}`);
        doc.end();
        const pdfData = Buffer.concat(buffers);
        return pdfData;
    }
}

module.exports = new FactureService();