const analyseRepository = require('../repositories/analyseRepository');
const { AnalyseStatus, UserRole, ErrorMessages } = require('../utils/constants');

class AnalyseService {
    async prescrire(data, userId, userRole) {
        if (userRole !== UserRole.MEDECIN && userRole !== UserRole.ADMIN) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        return await analyseRepository.create(data);
    }

    async getByPatient(patientId, requestingUserId, userRole) {
        if (userRole === UserRole.PATIENT && requestingUserId !== patientId) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        // medecin can view all
        return await analyseRepository.findByPatientId(patientId);
    }

    async getPendingLabo(userRole) {
        if (userRole !== UserRole.LABORANTIN && userRole !== UserRole.ADMIN) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        return await analyseRepository.findPendingForLabo();
    }

    async getById(id, requestingUserId, userRole) {
        const analyse = await analyseRepository.findById(id);
        if (!analyse) return null;
        // permissions
        if (userRole === UserRole.PATIENT && analyse.patient_id !== requestingUserId) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        if (userRole === UserRole.MEDECIN && analyse.medecin_prescripteur_id !== requestingUserId) {
            // maybe medecin can't see others
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        return analyse;
    }

    async saisirResultats(id, updates, userRole) {
        if (userRole !== UserRole.LABORANTIN && userRole !== UserRole.ADMIN) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        return await analyseRepository.updateResults(id, updates);
    }

    async changerStatut(id, statut, userRole) {
        if (userRole !== UserRole.LABORANTIN && userRole !== UserRole.ADMIN) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        return await analyseRepository.updateStatut(id, statut);
    }

    async ajouterDocument(id, doc, userRole) {
        if (userRole !== UserRole.LABORANTIN && userRole !== UserRole.ADMIN) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        return await analyseRepository.addDocument(id, doc);
    }

    async stats(userRole) {
        if (userRole !== UserRole.ADMIN) {
            throw new Error(ErrorMessages.FORBIDDEN);
        }
        return await analyseRepository.stats();
    }
}

module.exports = new AnalyseService();