const { pgPool } = require('../models/db');
const { AppointmentStatus } = require('../utils/constants');

class AppointmentRepository {
    
    // ==================== REQUÊTES POUR LES RENDEZ-VOUS ====================
    
    /**
     * Créer un nouveau rendez-vous
     */
    async create(appointmentData) {
        const query = `
            INSERT INTO appointments 
            (patient_id, medecin_id, hospital_id, date_heure, motif, statut)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const values = [
            appointmentData.patient_id,
            appointmentData.medecin_id,
            appointmentData.hospital_id,
            appointmentData.date_heure,
            appointmentData.motif || null,
            appointmentData.statut || AppointmentStatus.PENDING
        ];
        
        try {
            const result = await pgPool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Erreur repository create:', error);
            throw error;
        }
    }
    
    /**
     * Trouver un rendez-vous par son ID
     */
    async findById(id) {
        const query = 'SELECT * FROM appointments WHERE id = $1';
        
        try {
            const result = await pgPool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Erreur repository findById:', error);
            throw error;
        }
    }
    
    /**
     * Trouver tous les rendez-vous d'un patient
     */
    async findByPatientId(patientId, filters = {}) {
        let query = 'SELECT * FROM appointments WHERE patient_id = $1';
        const values = [patientId];
        let paramCount = 1;
        
        // Ajouter des filtres optionnels
        if (filters.statut) {
            paramCount++;
            query += ` AND statut = $${paramCount}`;
            values.push(filters.statut);
        }
        
        if (filters.date_debut) {
            paramCount++;
            query += ` AND date_heure >= $${paramCount}`;
            values.push(filters.date_debut);
        }
        
        if (filters.date_fin) {
            paramCount++;
            query += ` AND date_heure <= $${paramCount}`;
            values.push(filters.date_fin);
        }
        
        // Tri par date (plus récent d'abord)
        query += ' ORDER BY date_heure DESC';
        
        try {
            const result = await pgPool.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Erreur repository findByPatientId:', error);
            throw error;
        }
    }
    
    /**
     * Trouver tous les rendez-vous d'un médecin
     */
    async findByMedecinId(medecinId, date = null) {
        let query = 'SELECT * FROM appointments WHERE medecin_id = $1';
        const values = [medecinId];
        
        if (date) {
            query += ' AND DATE(date_heure) = $2';
            values.push(date);
        }
        
        query += ' ORDER BY date_heure ASC';
        
        try {
            const result = await pgPool.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Erreur repository findByMedecinId:', error);
            throw error;
        }
    }
    
    /**
     * Mettre à jour le statut d'un rendez-vous
     */
    async updateStatus(id, statut) {
        const query = `
            UPDATE appointments 
            SET statut = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        
        try {
            const result = await pgPool.query(query, [statut, id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Erreur repository updateStatus:', error);
            throw error;
        }
    }
    
    /**
     * Mettre à jour un rendez-vous
     */
    async update(id, updateData) {
        // Construire dynamiquement la requête UPDATE
        const fields = [];
        const values = [];
        let paramCount = 1;
        
        // Liste des champs modifiables
        const updatableFields = ['date_heure', 'motif', 'notes', 'statut'];
        
        updatableFields.forEach(field => {
            if (updateData[field] !== undefined) {
                fields.push(`${field} = $${paramCount}`);
                values.push(updateData[field]);
                paramCount++;
            }
        });
        
        if (fields.length === 0) {
            return this.findById(id); // Rien à mettre à jour
        }
        
        values.push(id); // Pour la clause WHERE
        
        const query = `
            UPDATE appointments 
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramCount}
            RETURNING *
        `;
        
        try {
            const result = await pgPool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Erreur repository update:', error);
            throw error;
        }
    }
    
    /**
     * Supprimer un rendez-vous (soft delete ou hard delete ?)
     * Ici on fait un hard delete, mais dans la vraie vie on ferait un soft delete
     */
    async delete(id) {
        const query = 'DELETE FROM appointments WHERE id = $1 RETURNING *';
        
        try {
            const result = await pgPool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Erreur repository delete:', error);
            throw error;
        }
    }
    
    /**
     * Vérifier si un créneau est disponible pour un médecin
     */
    async checkAvailability(medecinId, dateHeure, dureeMinutes = 60) {
        // Vérifier s'il n'y a pas de rendez-vous conflictuel
        const query = `
            SELECT * FROM appointments 
            WHERE medecin_id = $1 
            AND statut NOT IN ('annulé')
            AND date_heure BETWEEN $2 AND $3
        `;
        
        const dateDebut = new Date(dateHeure);
        const dateFin = new Date(dateHeure.getTime() + dureeMinutes * 60000);
        
        try {
            const result = await pgPool.query(query, [medecinId, dateDebut, dateFin]);
            return result.rows.length === 0; // true si dispo
        } catch (error) {
            console.error('Erreur repository checkAvailability:', error);
            throw error;
        }
    }
    
    // ==================== REQUÊTES POUR LES DISPONIBILITÉS ====================
    
    /**
     * Ajouter des créneaux de disponibilité pour un médecin
     */
    async addSchedule(scheduleData) {
        const query = `
            INSERT INTO schedules 
            (medecin_id, hospital_id, date_disponible, heure_debut, heure_fin)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const values = [
            scheduleData.medecin_id,
            scheduleData.hospital_id,
            scheduleData.date_disponible,
            scheduleData.heure_debut,
            scheduleData.heure_fin
        ];
        
        try {
            const result = await pgPool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Erreur repository addSchedule:', error);
            throw error;
        }
    }
    
    /**
     * Récupérer les disponibilités d'un médecin pour une date
     */
    async getSchedules(medecinId, date) {
        const query = `
            SELECT * FROM schedules 
            WHERE medecin_id = $1 AND date_disponible = $2 AND est_disponible = true
            ORDER BY heure_debut
        `;
        
        try {
            const result = await pgPool.query(query, [medecinId, date]);
            return result.rows;
        } catch (error) {
            console.error('Erreur repository getSchedules:', error);
            throw error;
        }
    }
    
    /**
     * Marquer un créneau comme indisponible (quand un RDV est pris)
     */
    async markSlotAsUnavailable(medecinId, date, heureDebut) {
        const query = `
            UPDATE schedules 
            SET est_disponible = false
            WHERE medecin_id = $1 AND date_disponible = $2 AND heure_debut = $3
            RETURNING *
        `;
        
        try {
            const result = await pgPool.query(query, [medecinId, date, heureDebut]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Erreur repository markSlotAsUnavailable:', error);
            throw error;
        }
    }
}

module.exports = new AppointmentRepository();