const ordonnanceRepository = require('../repositories/ordonnanceRepository');
const { OrdonnanceStatus, ErrorMessages, UserRole } = require('../utils/constants');

class OrdonnanceService {
    async createOrdonnance(data, userId, userRole) {
        // patient only for his own
        if (userRole === UserRole.PATIENT && data.patient_id !== userId) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }

        // calcul date_validite par défaut 1 an à partir de maintenant si pas fournie
        if (!data.date_validite) {
            const d = new Date();
            d.setFullYear(d.getFullYear() + 1);
            data.date_validite = d.toISOString().split('T')[0]; // date seule
        }

        // insérer ordonnance
        const ordonnance = await ordonnanceRepository.createOrdonnance(data);

        // ajouter les prescriptions
        if (data.prescriptions && data.prescriptions.length) {
            for (const pres of data.prescriptions) {
                await ordonnanceRepository.addPrescription(ordonnance.id, pres);
            }
            // récupérer et attacher
            const createdPres = await ordonnanceRepository.getPrescriptionsByOrdonnanceId(ordonnance.id);
            ordonnance.prescriptions = createdPres;
        } else {
            ordonnance.prescriptions = [];
        }
        return ordonnance;
    }

    async getOrdonnancesByPatient(patientId, requestingUserId, userRole) {
        if (userRole === UserRole.PATIENT && requestingUserId !== patientId) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        return await ordonnanceRepository.findByPatientId(patientId);
    }

    async getOrdonnancesByMedecin(medecinId, requestingUserId, userRole) {
        if (userRole === UserRole.MEDECIN && requestingUserId !== medecinId) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        return await ordonnanceRepository.findByMedecinId(medecinId);
    }

    async getOrdonnanceById(id, requestingUserId, userRole) {
        const ord = await ordonnanceRepository.findById(id);
        if (!ord) {
            return null;
        }
        if (userRole === UserRole.PATIENT && ord.patient_id !== requestingUserId) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        if (userRole === UserRole.MEDECIN && ord.medecin_id !== requestingUserId) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        // récupérer aussi les prescriptions associées
        const prescriptions = await ordonnanceRepository.getPrescriptionsByOrdonnanceId(id);
        ord.prescriptions = prescriptions;
        return ord;
    }

    async updateStatut(id, newStatus, userId, userRole) {
        const ord = await ordonnanceRepository.findById(id);
        if (!ord) {
            throw new Error(ErrorMessages.ORDONNANCE_NOT_FOUND);
        }
        // permission : medecin responsable ou admin ou pharmacien (pour valider?)
        if (userRole === UserRole.PATIENT) {
            throw new Error(ErrorMessages.FORBIDDEN_OPERATION);
        }
        if (userRole === UserRole.MEDECIN && ord.medecin_id !== userId) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        // on autorise seulement changement au sein des valeurs
        const updated = await ordonnanceRepository.updateStatut(id, newStatus);
        return updated;
    }

    async addPrescription(ordonnanceId, prescription, userId, userRole) {
        const ord = await ordonnanceRepository.findById(ordonnanceId);
        if (!ord) {
            throw new Error(ErrorMessages.ORDONNANCE_NOT_FOUND);
        }
        // seul medecin ou admin peuvent ajouter, et medecin doit être le bon
        if (userRole === UserRole.MEDECIN && ord.medecin_id !== userId) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        if (userRole === UserRole.PATIENT) {
            throw new Error(ErrorMessages.FORBIDDEN_OPERATION);
        }
        const pres = await ordonnanceRepository.addPrescription(ordonnanceId, prescription);
        return pres;
    }

    async deleteOrdonnance(id, userRole) {
        if (userRole !== UserRole.ADMIN) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        return await ordonnanceRepository.deleteOrdonnance(id);
    }

    async validateEnPharmacie(id, userRole) {
        if (userRole !== UserRole.PHARMACIEN && userRole !== UserRole.ADMIN) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        // mettre statut utilisé
        const updated = await ordonnanceRepository.updateStatut(id, OrdonnanceStatus.UTILISEE);
        return updated;
    }
}

module.exports = new OrdonnanceService();