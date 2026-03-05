const { pgPool } = require('../models/db');

class ServiceMedicalRepository {
    async create(s) {
        const q = `INSERT INTO services_medical (nom, description, departement_id, responsable_id, actif) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
        const vals = [s.nom,s.description||null,s.departement_id,s.responsable_id||null,s.actif===false?false:true];
        const res = await pgPool.query(q, vals);
        return res.rows[0];
    }

    async findById(id) {
        const res = await pgPool.query('SELECT * FROM services_medical WHERE id=$1', [id]);
        return res.rows[0]||null;
    }

    async findByDepartement(depId) {
        const res = await pgPool.query('SELECT * FROM services_medical WHERE departement_id=$1 ORDER BY nom', [depId]);
        return res.rows;
    }

    async update(id, data) {
        const fields = [];
        const values = [];
        let i=1;
        for (const k of ['nom','description','departement_id','responsable_id','actif']){
            if (data[k]!==undefined){ fields.push(`${k}=$${i}`); values.push(data[k]); i++; }
        }
        if (fields.length===0) return this.findById(id);
        values.push(id);
        const q = `UPDATE services_medical SET ${fields.join(',')}, updated_at=CURRENT_TIMESTAMP WHERE id=$${i} RETURNING *`;
        const res = await pgPool.query(q, values);
        return res.rows[0]||null;
    }

    async delete(id) {
        const res = await pgPool.query('DELETE FROM services_medical WHERE id=$1 RETURNING *', [id]);
        return res.rows[0]||null;
    }
}

module.exports = new ServiceMedicalRepository();