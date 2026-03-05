const remboursementRepo = require('../repositories/remboursementRepository');
const paiementRepo = require('../repositories/paiementRepository');
const factureRepo = require('../repositories/factureRepository');

class RemboursementService {
    async request(paiementId, montant, raison) {
        const paiement = await paiementRepo.findById(paiementId);
        if (!paiement) throw new Error('Paiement introuvable');
        // verify not over refund
        const facture = await factureRepo.findById(paiement.facture_id);
        if (!facture) throw new Error('Facture introuvable');
        const remaining = parseFloat(paiement.montant) - (parseFloat(facture.montant_remboursement)||0);
        if (montant > remaining) throw new Error('Montant remboursement trop élevé');
        const req = await remboursementRepo.create({ paiement_id: paiementId, facture_id: paiement.facture_id, montant, raison });
        return req;
    }

    async process(id, statut) {
        return await remboursementRepo.updateStatus(id, statut);
    }

    async history(patientId) {
        return await remboursementRepo.findByPatient(patientId);
    }
}

module.exports = new RemboursementService();