const { pgPool } = require('../models/db');

class OrdonnanceRepository {
    async createOrdonnance(data) {
        const query = `
            INSERT INTO ordonnances
            (patient_id, medecin_id, date_validite, diagnostic, notes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            data.patient_id,
            data.medecin_id,
            data.date_validite || null,
            data.diagnostic || null,
            data.notes || null
        ];
        try {
            const result = await pgPool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Erreur repository createOrdonnance:', error);
            throw error;
        }
    }

    async findById(id) {
        const query = 'SELECT * FROM ordonnances WHERE id = $1';
        try {
            const result = await pgPool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Erreur repository findById:', error);
            throw error;
        }
    }

    async findByPatientId(patientId) {
        const query = 'SELECT * FROM ordonnances WHERE patient_id = $1 ORDER BY date_prescription DESC';
        try {
            const result = await pgPool.query(query, [patientId]);
            return result.rows;
        } catch (error) {
            console.error('Erreur repository findByPatientId:', error);
            throw error;
        }
    }

    async findByMedecinId(medecinId) {
        const query = 'SELECT * FROM ordonnances WHERE medecin_id = $1 ORDER BY date_prescription DESC';
        try {
            const result = await pgPool.query(query, [medecinId]);
            return result.rows;
        } catch (error) {
            console.error('Erreur repository findByMedecinId:', error);
            throw error;
        }
    }

    async updateStatut(id, statut) {
        const query = `
            UPDATE ordonnances
            SET statut = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        try {
            const result = await pgPool.query(query, [statut, id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Erreur repository updateStatut:', error);
            throw error;
        }
    }

    async deleteOrdonnance(id) {
        const query = 'DELETE FROM ordonnances WHERE id = $1 RETURNING *';
        try {
            const result = await pgPool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Erreur repository deleteOrdonnance:', error);
            throw error;
        }
    }

    async addPrescription(ordonnanceId, prescription) {
        const query = `
            INSERT INTO prescriptions
            (ordonnance_id, medicament_id, medicament_nom, dosage, duree_traitement, posologie, quantite, renouvelable, instructions)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *
        `;
        const values = [
            ordonnanceId,
            prescription.medicament_id,
            prescription.medicament_nom || null,
            prescription.dosage || null,
            prescription.duree_traitement || null,
            prescription.posologie || null,
            prescription.quantite || null,
            prescription.renouvelable || false,
            prescription.instructions || null
        ];
        try {
            const result = await pgPool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Erreur repository addPrescription:', error);
            throw error;
        }
    }

    async getPrescriptionsByOrdonnanceId(ordonnanceId) {
        const query = 'SELECT * FROM prescriptions WHERE ordonnance_id = $1';
        try {
            const result = await pgPool.query(query, [ordonnanceId]);
            return result.rows;
        } catch (error) {
            console.error('Erreur repository getPrescriptionsByOrdonnanceId:', error);
            throw error;
        }
    }
}

module.exports = new OrdonnanceRepository();