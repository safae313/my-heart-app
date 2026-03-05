const appointmentService = require('../services/appointmentService');
const { AppointmentStatus } = require('../utils/constants');

class AppointmentController {
    
    // ==================== CRÉATION DE RENDEZ-VOUS ====================
    
    /**
     * Créer un nouveau rendez-vous
     * POST /api/appointments
     */
    async createAppointment(req, res, next) {
        try {
            // Les données validées sont dans req.body (grâce au middleware)
            // Les infos utilisateur sont dans req.user (grâce à auth middleware)
            const appointmentData = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;
            
            // Appel au service
            const appointment = await appointmentService.createAppointment(
                appointmentData,
                userId,
                userRole
            );
            
            // Réponse succès
            res.status(201).json({
                success: true,
                message: 'Rendez-vous créé avec succès',
                data: appointment
            });
            
        } catch (error) {
            // Passer l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    }
    
    // ==================== LECTURE DE RENDEZ-VOUS ====================
    
    /**
     * Récupérer les rendez-vous du patient connecté
     * GET /api/appointments/patient/mes-rendez-vous
     */
    async getMyPatientAppointments(req, res, next) {
        try {
            const patientId = req.user.id; // Le patient connecté
            const filters = {
                statut: req.query.statut,
                date_debut: req.query.date_debut,
                date_fin: req.query.date_fin
            };
            
            const appointments = await appointmentService.getPatientAppointments(
                patientId,
                filters,
                patientId,
                req.user.role
            );
            
            res.status(200).json({
                success: true,
                count: appointments.length,
                data: appointments
            });
            
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * Récupérer les rendez-vous d'un patient spécifique (pour médecin/admin)
     * GET /api/appointments/patient/:patientId
     */
    async getPatientAppointments(req, res, next) {
        try {
            const { patientId } = req.params;
            const filters = {
                statut: req.query.statut,
                date_debut: req.query.date_debut,
                date_fin: req.query.date_fin
            };
            
            const appointments = await appointmentService.getPatientAppointments(
                parseInt(patientId),
                filters,
                req.user.id,
                req.user.role
            );
            
            res.status(200).json({
                success: true,
                count: appointments.length,
                data: appointments
            });
            
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * Récupérer les rendez-vous du médecin connecté
     * GET /api/appointments/medecin/mes-rendez-vous
     */
    async getMyMedecinAppointments(req, res, next) {
        try {
            const medecinId = req.user.id;
            const { date } = req.query;
            
            const appointments = await appointmentService.getMedecinAppointments(
                medecinId,
                date,
                medecinId,
                req.user.role
            );
            
            res.status(200).json({
                success: true,
                count: appointments.length,
                data: appointments
            });
            
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * Récupérer les rendez-vous d'un médecin spécifique (pour admin)
     * GET /api/appointments/medecin/:medecinId
     */
    async getMedecinAppointments(req, res, next) {
        try {
            const { medecinId } = req.params;
            const { date } = req.query;
            
            const appointments = await appointmentService.getMedecinAppointments(
                parseInt(medecinId),
                date,
                req.user.id,
                req.user.role
            );
            
            res.status(200).json({
                success: true,
                count: appointments.length,
                data: appointments
            });
            
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * Récupérer un rendez-vous par son ID
     * GET /api/appointments/:id
     */
    async getAppointmentById(req, res, next) {
        try {
            const { id } = req.params;
            
            // Note: Il faudrait ajouter une méthode dans le service
            // Pour l'instant, on va utiliser le repository directement ?
            // Non, mieux vaut créer une méthode dans le service
            // Je te montre la bonne pratique:
            
            const appointment = await appointmentService.getAppointmentById(
                parseInt(id),
                req.user.id,
                req.user.role
            );
            
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Rendez-vous non trouvé'
                });
            }
            
            res.status(200).json({
                success: true,
                data: appointment
            });
            
        } catch (error) {
            next(error);
        }
    }
    
    // ==================== MISE À JOUR DES RENDEZ-VOUS ====================
    
    /**
     * Mettre à jour le statut d'un rendez-vous
     * PATCH /api/appointments/:id/status
     */
    async updateAppointmentStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { statut } = req.body;
            
            const updated = await appointmentService.updateAppointmentStatus(
                parseInt(id),
                statut,
                req.user.id,
                req.user.role
            );
            
            res.status(200).json({
                success: true,
                message: `Statut mis à jour: ${statut}`,
                data: updated
            });
            
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * Annuler un rendez-vous
     * POST /api/appointments/:id/cancel
     */
    async cancelAppointment(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            
            const cancelled = await appointmentService.cancelAppointment(
                parseInt(id),
                reason,
                req.user.id,
                req.user.role
            );
            
            res.status(200).json({
                success: true,
                message: 'Rendez-vous annulé avec succès',
                data: cancelled
            });
            
        } catch (error) {
            next(error);
        }
    }
    
    // ==================== DISPONIBILITÉS ====================
    
    /**
     * Vérifier la disponibilité d'un créneau
     * POST /api/appointments/check-availability
     */
    async checkAvailability(req, res, next) {
        try {
            const { medecin_id, date_heure, duree } = req.body;
            
            const isAvailable = await appointmentService.checkAvailability(
                medecin_id,
                new Date(date_heure),
                duree || 60
            );
            
            res.status(200).json({
                success: true,
                data: {
                    available: isAvailable,
                    medecin_id,
                    date_heure
                }
            });
            
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * Obtenir les créneaux disponibles d'un médecin
     * GET /api/appointments/available-slots
     */
    async getAvailableSlots(req, res, next) {
        try {
            const { medecin_id, date } = req.query;
            
            if (!medecin_id || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'medecin_id et date sont requis'
                });
            }
            
            const slots = await appointmentService.getAvailableSlots(
                parseInt(medecin_id),
                date
            );
            
            res.status(200).json({
                success: true,
                data: slots
            });
            
        } catch (error) {
            next(error);
        }
    }
    
    // ==================== STATISTIQUES (pour admin) ====================
    
    /**
     * Obtenir des statistiques sur les rendez-vous
     * GET /api/appointments/stats
     */
    async getStats(req, res, next) {
        try {
            // Seul l'admin peut voir les stats globales
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Accès réservé aux administrateurs'
                });
            }
            
            const { debut, fin, hospital_id } = req.query;
            
            // À implémenter dans le service
            const stats = await appointmentService.getStats({
                debut,
                fin,
                hospital_id
            });
            
            res.status(200).json({
                success: true,
                data: stats
            });
            
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AppointmentController();