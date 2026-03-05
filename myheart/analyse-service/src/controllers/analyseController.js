const analyseService = require('../services/analyseService');

class AnalyseController {
    async prescrire(req, res, next) {
        try {
            const data = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;
            const analyse = await analyseService.prescrire(data, userId, userRole);
            res.status(201).json({ success: true, message: 'Analyse prescrite', data: analyse });
        } catch (err) {
            next(err);
        }
    }

    async listByPatient(req, res, next) {
        try {
            const { patientId } = req.params;
            const analyses = await analyseService.getByPatient(
                parseInt(patientId),
                req.user.id,
                req.user.role
            );
            res.status(200).json({ success: true, count: analyses.length, data: analyses });
        } catch (err) {
            next(err);
        }
    }

    async listPending(req, res, next) {
        try {
            const analyses = await analyseService.getPendingLabo(req.user.role);
            res.status(200).json({ success: true, count: analyses.length, data: analyses });
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const analyse = await analyseService.getById(
                id,
                req.user.id,
                req.user.role
            );
            if (!analyse) {
                return res.status(404).json({ success: false, message: 'Analyse non trouvée' });
            }
            res.status(200).json({ success: true, data: analyse });
        } catch (err) {
            next(err);
        }
    }

    async saisirResultats(req, res, next) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const updated = await analyseService.saisirResultats(id, updates, req.user.role);
            res.status(200).json({ success: true, message: 'Résultats saisis', data: updated });
        } catch (err) {
            next(err);
        }
    }

    async changerStatut(req, res, next) {
        try {
            const { id } = req.params;
            const { statut } = req.body;
            const updated = await analyseService.changerStatut(id, statut, req.user.role);
            res.status(200).json({ success: true, message: 'Statut mis à jour', data: updated });
        } catch (err) {
            next(err);
        }
    }

    async ajouterDocument(req, res, next) {
        try {
            const { id } = req.params;
            const doc = req.body;
            const updated = await analyseService.ajouterDocument(id, doc, req.user.role);
            res.status(200).json({ success: true, message: 'Document ajouté', data: updated });
        } catch (err) {
            next(err);
        }
    }

    async stats(req, res, next) {
        try {
            const data = await analyseService.stats(req.user.role);
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AnalyseController();