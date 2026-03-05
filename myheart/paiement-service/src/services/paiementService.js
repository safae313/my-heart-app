const paiementRepo = require('../repositories/paiementRepository');
const factureRepo = require('../repositories/factureRepository');
const { pgPool } = require('../models/db');
const { ErrorMessages, PaiementStatus, FactureStatus } = require('../utils/constants');

class PaiementService {
    // Create a payment ensuring idempotence via reference_transaction
    async pay(data) {
        // transactionally verify and insert
        return await pgPool.connect().then(async client => {
            try {
                await client.query('BEGIN');
                // check facture exists and status
                const fact = await factureRepo.findById(data.facture_id);
                if (!fact) throw new Error(ErrorMessages.NOT_FOUND);
                if (fact.statut === FactureStatus.PAYEE) throw new Error(ErrorMessages.PAYMENT_ALREADY_MADE);
                // create payment
                const payment = await paiementRepo.create(data);
                // update facture remainder
                const newReste = parseFloat(fact.reste_a_charge) - parseFloat(data.montant);
                const newStatus = newReste <= 0 ? FactureStatus.PAYEE : FactureStatus.PARTIELLEMENT_PAYEE;
                await factureRepo.update(fact.id, { reste_a_charge: newReste, statut: newStatus });
                await client.query('COMMIT');
                return payment;
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        });
    }

    async history(patientId) {
        return await paiementRepo.findByPatient(patientId);
    }

    async getStatus(id) {
        return await paiementRepo.findById(id);
    }
}

module.exports = new PaiementService();