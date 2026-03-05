const { pgPool } = require('../models/db');

class RemboursementRepository {
    async create(data) {
        const query = `
            INSERT INTO remboursements
            (paiement_id, facture_id, montant, raison, statut, date_effet)
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING *
        `;
        const vals = [
            data.paiement_id,
            data.facture_id,
            data.montant,
            data.raison || null,
            data.statut || 'en_attente',
            data.date_effet || null
        ];
        const res = await pgPool.query(query, vals);
        return res.rows[0];
    }

    async findById(id) {
        const res = await pgPool.query('SELECT * FROM remboursements WHERE id=$1', [id]);
        return res.rows[0] || null;
    }

    async findByPatient(patientId) {
        const res = await pgPool.query('SELECT * FROM remboursements WHERE facture_id IN (SELECT id FROM factures WHERE patient_id=$1) ORDER BY date_demande DESC', [patientId]);
        return res.rows;
    }

    async updateStatus(id, statut) {
        const res = await pgPool.query(
            'UPDATE remboursements SET statut=$1 WHERE id=$2 RETURNING *',
            [statut, id]
        );
        return res.rows[0] || null;
    }
}

module.exports = new RemboursementRepository();