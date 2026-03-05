const appointmentRepository = require('../repositories/appointmentRepository');
const { AppointmentStatus, ErrorMessages } = require('../utils/constants');
const { redisClient } = require('../models/db');

class AppointmentService {
    
    // ==================== GESTION DES RENDEZ-VOUS ====================
    
    /**
     * Créer un nouveau rendez-vous avec toutes les vérifications
     */
    async createAppointment(appointmentData, userId, userRole) {
        // Étape 1: Vérifier les permissions
        // - Un patient ne peut créer que ses propres rendez-vous
        // - Un médecin/admin peut créer pour d'autres
        if (userRole === 'patient' && appointmentData.patient_id !== userId) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        
        // Étape 2: Vérifier que le créneau est disponible
        const dateHeure = new Date(appointmentData.date_heure);
        const isAvailable = await this.checkAvailability(
            appointmentData.medecin_id,
            dateHeure
        );
        
        if (!isAvailable) {
            throw new Error(ErrorMessages.SLOT_UNAVAILABLE);
        }
        
        // Étape 3: Vérifier que la date n'est pas dans le passé
        if (dateHeure < new Date()) {
            throw new Error('Impossible de prendre un rendez-vous dans le passé');
        }
        
        // Étape 4: Créer le rendez-vous
        const appointment = await appointmentRepository.create({
            ...appointmentData,
            statut: AppointmentStatus.PENDING // Par défaut en attente
        });
        
        // Étape 5: Invalider le cache des disponibilités
        await this.invalidateAvailabilityCache(appointmentData.medecin_id, dateHeure);
        
        // Étape 6: Programmer un rappel (via RabbitMQ plus tard)
        // Pour l'instant on log simplement
        console.log(`📅 Rappel programmé pour le RDV ${appointment.id}`);
        
        return appointment;
    }
    
    /**
     * Récupérer les rendez-vous d'un patient avec filtres
     */
    async getPatientAppointments(patientId, filters = {}, requestingUserId, userRole) {
        // Vérifier les permissions
        if (userRole === 'patient' && requestingUserId !== patientId) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        
        // Essayer d'abord le cache Redis
        const cacheKey = `patient:${patientId}:appointments:${JSON.stringify(filters)}`;
        
        try {
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                console.log('📦 Données servies depuis le cache');
                return JSON.parse(cached);
            }
        } catch (err) {
            console.error('Erreur cache Redis:', err);
            // On continue même si Redis échoue
        }
        
        // Sinon, aller en base de données
        const appointments = await appointmentRepository.findByPatientId(patientId, filters);
        
        // Mettre en cache pour 5 minutes
        try {
            await redisClient.setEx(cacheKey, 300, JSON.stringify(appointments));
        } catch (err) {
            console.error('Erreur mise en cache:', err);
        }
        
        return appointments;
    }
    
    /**
     * Récupérer les rendez-vous d'un médecin
     */
    async getMedecinAppointments(medecinId, date = null, requestingUserId, userRole) {
        // Seuls le médecin concerné ou un admin peuvent voir
        if (userRole !== 'admin' && requestingUserId !== medecinId) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        
        return await appointmentRepository.findByMedecinId(medecinId, date);
    }
    
    /**
     * Mettre à jour le statut d'un rendez-vous
     */
    async updateAppointmentStatus(appointmentId, newStatus, userId, userRole) {
        // Récupérer le rendez-vous
        const appointment = await appointmentRepository.findById(appointmentId);
        
        if (!appointment) {
            throw new Error(ErrorMessages.APPOINTMENT_NOT_FOUND);
        }
        
        // Vérifier les permissions selon le rôle
        if (userRole === 'patient') {
            // Un patient ne peut qu'annuler ses propres rendez-vous en attente
            if (appointment.patient_id !== userId) {
                throw new Error(ErrorMessages.FORBIDDEN);
            }
            if (newStatus !== AppointmentStatus.CANCELLED) {
                throw new Error('Les patients ne peuvent que annuler leurs rendez-vous');
            }
            if (appointment.statut !== AppointmentStatus.PENDING) {
                throw new Error('Vous ne pouvez annuler qu\'un rendez-vous en attente');
            }
        }
        
        if (userRole === 'medecin') {
            // Un médecin ne peut modifier que ses propres rendez-vous
            if (appointment.medecin_id !== userId) {
                throw new Error(ErrorMessages.FORBIDDEN);
            }
            // Un médecin peut confirmer ou terminer
            if (![AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED].includes(newStatus)) {
                throw new Error('Action non autorisée pour un médecin');
            }
        }
        
        // Admin peut tout faire (pas de vérification supplémentaire)
        
        // Mettre à jour le statut
        const updated = await appointmentRepository.updateStatus(appointmentId, newStatus);
        
        // Invalider les caches liés
        await this.invalidatePatientCache(appointment.patient_id);
        
        // Si le rendez-vous est confirmé, on pourrait notifier le patient
        if (newStatus === AppointmentStatus.CONFIRMED) {
            console.log(`📧 Notification: RDV ${appointmentId} confirmé pour patient ${appointment.patient_id}`);
        }
        
        return updated;
    }
    
    /**
     * Vérifier la disponibilité d'un créneau
     */
    async checkAvailability(medecinId, dateHeure, dureeMinutes = 60) {
        // Vérifier d'abord dans le cache Redis
        const cacheKey = `availability:${medecinId}:${dateHeure.toISOString()}`;
        
        try {
            const cached = await redisClient.get(cacheKey);
            if (cached !== null) {
                return cached === 'true';
            }
        } catch (err) {
            console.error('Erreur cache Redis:', err);
        }
        
        // Sinon vérifier en base
        const isAvailable = await appointmentRepository.checkAvailability(
            medecinId, 
            dateHeure, 
            dureeMinutes
        );
        
        // Mettre en cache pour 1 minute seulement (car les dispos changent vite)
        try {
            await redisClient.setEx(cacheKey, 60, String(isAvailable));
        } catch (err) {
            console.error('Erreur mise en cache:', err);
        }
        
        return isAvailable;
    }
    
    /**
     * Obtenir les créneaux disponibles d'un médecin pour une date
     */
    async getAvailableSlots(medecinId, date) {
        // Récupérer les créneaux théoriques du médecin
        const schedules = await appointmentRepository.getSchedules(medecinId, date);
        
        // Récupérer les rendez-vous déjà pris ce jour-là
        const appointments = await appointmentRepository.findByMedecinId(medecinId, date);
        
        // Filtrer pour ne garder que les créneaux disponibles
        const bookedSlots = appointments.map(apt => {
            const heure = new Date(apt.date_heure);
            return heure.toTimeString().substring(0, 5); // Format HH:MM
        });
        
        const availableSlots = schedules.filter(slot => {
            const slotTime = slot.heure_debut.substring(0, 5);
            return !bookedSlots.includes(slotTime) && slot.est_disponible;
        });
        
        return availableSlots;
    }
    
    // ==================== MÉTHODES PRIVÉES ====================
    
    /**
     * Invalider le cache des disponibilités
     */
    async invalidateAvailabilityCache(medecinId, dateHeure) {
        const date = dateHeure.toISOString().split('T')[0];
        const pattern = `availability:${medecinId}:${date}*`;
        
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(keys);
                console.log(`🗑️ Cache invalidé: ${keys.length} clés`);
            }
        } catch (err) {
            console.error('Erreur invalidation cache:', err);
        }
    }
    
    /**
     * Invalider le cache d'un patient
     */
    async invalidatePatientCache(patientId) {
        try {
            const keys = await redisClient.keys(`patient:${patientId}:*`);
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
        } catch (err) {
            console.error('Erreur invalidation cache patient:', err);
        }
    }
    
    /**
     * Annuler un rendez-vous (méthode spécifique)
     */
    async cancelAppointment(appointmentId, reason, userId, userRole) {
        const appointment = await appointmentRepository.findById(appointmentId);
        
        if (!appointment) {
            throw new Error(ErrorMessages.APPOINTMENT_NOT_FOUND);
        }
        
        // Vérifier les permissions
        if (userRole === 'patient' && appointment.patient_id !== userId) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        
        if (userRole === 'medecin' && appointment.medecin_id !== userId) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        
        // Vérifier que le rendez-vous peut être annulé
        if (appointment.statut === AppointmentStatus.COMPLETED) {
            throw new Error('Impossible d\'annuler un rendez-vous terminé');
        }
        
        // Mettre à jour avec la raison d'annulation
        const updated = await appointmentRepository.update(appointmentId, {
            statut: AppointmentStatus.CANCELLED,
            notes: `Annulé: ${reason || 'Non spécifié'}`
        });
        
        // Invalider les caches
        await this.invalidateAvailabilityCache(appointment.medecin_id, new Date(appointment.date_heure));
        await this.invalidatePatientCache(appointment.patient_id);
        
        return updated;
    }
    /**
 * Récupérer un rendez-vous par son ID avec vérification des permissions
 */
    async getAppointmentById(appointmentId, userId, userRole) {
      const appointment = await appointmentRepository.findById(appointmentId);
    
      if (!appointment) {
        return null;
       }
    
    // Vérifier les permissions
      if (userRole === 'patient' && appointment.patient_id !== userId) {
        throw new Error(ErrorMessages.FORBIDDEN);
       }
    
       if (userRole === 'medecin' && appointment.medecin_id !== userId) {
        throw new Error(ErrorMessages.FORBIDDEN);
       }
    
    // Admin peut tout voir
       return appointment;
}
}

    

module.exports = new AppointmentService();