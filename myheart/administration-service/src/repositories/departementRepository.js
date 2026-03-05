const { pgPool } = require('../models/db');

class DepartementRepository {
    async create(d) {
        const q = `INSERT INTO departements (nom, description, hospital_id, chef_departement_id, actif) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
        const vals = [d.nom,d.description||null,d.hospital_id,d.chef_departement_id||null,d.actif===false?false:true];
        const res = await pgPool.query(q, vals);
        return res.rows[0];
    }

    async findById(id) {
        const res = await pgPool.query('SELECT * FROM departements WHERE id=$1', [id]);
        return res.rows[0]||null;
    }

    async findByHospital(hospitalId) {
        const res = await pgPool.query('SELECT * FROM departements WHERE hospital_id=$1 ORDER BY nom', [hospitalId]);
        return res.rows;
    }

    async update(id, data) {
        const fields = [];
        const values = [];
        let i=1;
        for (const k of ['nom','description','hospital_id','chef_departement_id','actif']){
            if (data[k]!==undefined){ fields.push(`${k}=$${i}`); values.push(data[k]); i++; }
        }
        if (fields.length===0) return this.findById(id);
        values.push(id);
        const q = `UPDATE departements SET ${fields.join(',')}, updated_at=CURRENT_TIMESTAMP WHERE id=$${i} RETURNING *`;
        const res = await pgPool.query(q, values);
        return res.rows[0]||null;
    }

    async delete(id) {
        const res = await pgPool.query('DELETE FROM departements WHERE id=$1 RETURNING *', [id]);
        return res.rows[0]||null;
    }

    async assignChief(id, chefId) {
        return await this.update(id, { chef_departement_id: chefId });
    }

    async linkMedecins(departementId, medecinIds) {
        // This is a placeholder: in a real system you'd have a linking table. For now we store responsable in services.
        // Return departement
        return await this.findById(departementId);
    }
}

module.exports = new DepartementRepository();