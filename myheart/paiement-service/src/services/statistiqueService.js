const { pgPool } = require('../models/db');

class StatistiqueService {
    async periodStats(debut, fin) {
        const res = await pgPool.query(
            `SELECT statut, COUNT(*) as count, SUM(montant) as total
             FROM paiements
             WHERE date_paiement BETWEEN $1 AND $2
             GROUP BY statut`,
            [debut, fin]
        );
        return res.rows;
    }

    async chiffreAffaires(periode) {
        let interval;
        switch(periode){
            case 'jour': interval = "date_paiement::date"; break;
            case 'mois': interval = "date_trunc('month', date_paiement)"; break;
            case 'an': interval = "date_trunc('year', date_paiement)"; break;
            default: interval = "date_paiement::date";
        }
        const res = await pgPool.query(
            `SELECT ${interval} as period, SUM(montant) as total
             FROM paiements
             GROUP BY ${interval}
             ORDER BY ${interval}`
        );
        return res.rows;
    }
}

module.exports = new StatistiqueService();