const ordonnanceService = require('../services/ordonnanceService');

class OrdonnanceController {
    async createOrdonnance(req, res, next) {
        try {
            const data = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            const ordonnance = await ordonnanceService.createOrdonnance(data, userId, userRole);
            res.status(201).json({ success: true, message: 'Ordonnance créée', data: ordonnance });
        } catch (error) {
            next(error);
        }
    }

    async getOrdonnanceById(req, res, next) {
        try {
            const { id } = req.params;
            const ordonnance = await ordonnanceService.getOrdonnanceById(
                parseInt(id),
                req.user.id,
                req.user.role
            );
            if (!ordonnance) {
                return res.status(404).json({ success: false, message: 'Ordonnance non trouvée' });
            }
            res.status(200).json({ success: true, data: ordonnance });
        } catch (error) {
            next(error);
        }
    }

    async getOrdonnancesByPatient(req, res, next) {
        try {
            const { patientId } = req.params;
            const ords = await ordonnanceService.getOrdonnancesByPatient(
                parseInt(patientId),
                req.user.id,
                req.user.role
            );
            res.status(200).json({ success: true, count: ords.length, data: ords });
        } catch (error) {
            next(error);
        }
    }

    async getOrdonnancesByMedecin(req, res, next) {
        try {
            const { medecinId } = req.params;
            const ords = await ordonnanceService.getOrdonnancesByMedecin(
                parseInt(medecinId),
                req.user.id,
                req.user.role
            );
            res.status(200).json({ success: true, count: ords.length, data: ords });
        } catch (error) {
            next(error);
        }
    }

    async updateStatut(req, res, next) {
        try {
            const { id } = req.params;
            const { statut } = req.body;
            const updated = await ordonnanceService.updateStatut(
                parseInt(id),
                statut,
                req.user.id,
                req.user.role
            );
            res.status(200).json({ success: true, message: 'Statut mis à jour', data: updated });
        } catch (error) {
            next(error);
        }
    }

    async addPrescription(req, res, next) {
        try {
            const { id } = req.params;
            const prescription = req.body;
            const pres = await ordonnanceService.addPrescription(
                parseInt(id),
                prescription,
                req.user.id,
                req.user.role
            );
            res.status(201).json({ success: true, message: 'Prescription ajoutée', data: pres });
        } catch (error) {
            next(error);
        }
    }

    async deleteOrdonnance(req, res, next) {
        try {
            const { id } = req.params;
            await ordonnanceService.deleteOrdonnance(parseInt(id), req.user.role);
            res.status(200).json({ success: true, message: 'Ordonnance supprimée' });
        } catch (error) {
            next(error);
        }
    }

    async validateEnPharmacie(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await ordonnanceService.validateEnPharmacie(
                parseInt(id),
                req.user.role
            );
            res.status(200).json({ success: true, message: 'Ordonnance validée en pharmacie', data: updated });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrdonnanceController();