const { pgPool } = require('../models/db');

class HopitalRepository {
    async create(h) {
        const q = `INSERT INTO hopitaux (nom, adresse, ville, code_postal, telephone, email, type, actif) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
        const vals = [h.nom,h.adresse||null,h.ville||null,h.code_postal||null,h.telephone||null,h.email||null,h.type||null,h.actif===false?false:true];
        const res = await pgPool.query(q, vals);
        return res.rows[0];
    }

    async findById(id) {
        const res = await pgPool.query('SELECT * FROM hopitaux WHERE id=$1', [id]);
        return res.rows[0]||null;
    }

    async findAll() {
        const res = await pgPool.query('SELECT * FROM hopitaux ORDER BY nom');
        return res.rows;
    }

    async update(id, data) {
        const fields = [];
        const values = [];
        let i=1;
        for (const k of ['nom','adresse','ville','code_postal','telephone','email','type','actif']){
            if (data[k]!==undefined){ fields.push(`${k}=$${i}`); values.push(data[k]); i++; }
        }
        if (fields.length===0) return this.findById(id);
        values.push(id);
        const q = `UPDATE hopitaux SET ${fields.join(',')}, updated_at=CURRENT_TIMESTAMP WHERE id=$${i} RETURNING *`;
        const res = await pgPool.query(q, values);
        return res.rows[0]||null;
    }

    async delete(id) {
        const res = await pgPool.query('DELETE FROM hopitaux WHERE id=$1 RETURNING *', [id]);
        return res.rows[0]||null;
    }

    async statsByHopital(id) {
        // example: count departments and services
        const q = `SELECT h.*, 
            (SELECT COUNT(*) FROM departements d WHERE d.hospital_id=h.id) AS departements_count,
            (SELECT COUNT(*) FROM services_medical s WHERE s.departement_id IN (SELECT id FROM departements WHERE hospital_id=h.id)) AS services_count
            FROM hopitaux h WHERE h.id=$1`;
        const res = await pgPool.query(q, [id]);
        return res.rows[0]||null;
    }
}

module.exports = new HopitalRepository();