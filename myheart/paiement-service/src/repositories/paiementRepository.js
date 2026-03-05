const { pgPool } = require('../models/db');

class PaiementRepository {
    async create(data) {
        const query = `
            INSERT INTO paiements
            (facture_id, patient_id, montant, methode, reference_transaction, statut, date_paiement, dernier_statut_check, tentative_number, metadata)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *
        `;
        const vals = [
            data.facture_id,
            data.patient_id,
            data.montant,
            data.methode,
            data.reference_transaction || null,
            data.statut || 'en_attente',
            data.date_paiement || null,
            data.dernier_statut_check || null,
            data.tentative_number || 1,
            data.metadata ? JSON.stringify(data.metadata) : null
        ];
        const res = await pgPool.query(query, vals);
        return res.rows[0];
    }

    async findById(id) {
        const res = await pgPool.query('SELECT * FROM paiements WHERE id=$1', [id]);
        return res.rows[0] || null;
    }

    async findByPatient(patientId) {
        const res = await pgPool.query('SELECT * FROM paiements WHERE patient_id=$1 ORDER BY date_paiement DESC', [patientId]);
        return res.rows;
    }

    async updateStatus(id, statut) {
        const res = await pgPool.query(
            'UPDATE paiements SET statut=$1, dernier_statut_check=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *',
            [statut, id]
        );
        return res.rows[0] || null;
    }

    async incrementAttempt(id) {
        const res = await pgPool.query(
            'UPDATE paiements SET tentative_number = tentative_number + 1 WHERE id=$1 RETURNING *',
            [id]
        );
        return res.rows[0] || null;
    }
}

module.exports = new PaiementRepository();