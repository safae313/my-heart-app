const { pgPool } = require('../models/db');

class FactureRepository {
    async create(data) {
        const query = `
            INSERT INTO factures
            (patient_id, consultation_id, ordonnance_id, analyse_id, numero_facture, date_echeance, montant_total, montant_remboursement, reste_a_charge, statut, description)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING *
        `;
        const vals = [
            data.patient_id,
            data.consultation_id || null,
            data.ordonnance_id || null,
            data.analyse_id || null,
            data.numero_facture,
            data.date_echeance || null,
            data.montant_total,
            data.montant_remboursement || 0,
            data.reste_a_charge,
            data.statut || 'emise',
            data.description || null
        ];
        const res = await pgPool.query(query, vals);
        return res.rows[0];
    }

    async findById(id) {
        const res = await pgPool.query('SELECT * FROM factures WHERE id=$1', [id]);
        return res.rows[0] || null;
    }

    async findByPatient(patientId) {
        const res = await pgPool.query('SELECT * FROM factures WHERE patient_id=$1 ORDER BY date_emission DESC', [patientId]);
        return res.rows;
    }

    async updateStatut(id, statut) {
        const res = await pgPool.query(
            'UPDATE factures SET statut=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *',
            [statut, id]
        );
        return res.rows[0] || null;
    }

    async update(id, data) {
        const fields = [];
        const vals = [];
        let i = 1;
        for (const k of ['date_echeance','montant_total','montant_remboursement','reste_a_charge','statut','description']){
            if (data[k]!==undefined){ fields.push(`${k}=$${i}`); vals.push(data[k]); i++; }
        }
        if (fields.length===0) return this.findById(id);
        vals.push(id);
        const q = `UPDATE factures SET ${fields.join(',')}, updated_at=CURRENT_TIMESTAMP WHERE id=$${i} RETURNING *`;
        const res = await pgPool.query(q, vals);
        return res.rows[0]||null;
    }
}

module.exports = new FactureRepository();