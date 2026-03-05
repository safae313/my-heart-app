const { pgPool } = require('../models/db');

class PrestataireRepository {
    async listAll() {
        const res = await pgPool.query('SELECT * FROM prestataires ORDER BY nom');
        return res.rows;
    }

    async findById(id) {
        const res = await pgPool.query('SELECT * FROM prestataires WHERE id=$1', [id]);
        return res.rows[0] || null;
    }

    async create(data) {
        const res = await pgPool.query(
            'INSERT INTO prestataires (nom, type, config, actif) VALUES ($1,$2,$3,$4) RETURNING *',
            [data.nom, data.type, data.config ? JSON.stringify(data.config) : null, data.actif===false?false:true]
        );
        return res.rows[0];
    }

    async update(id, data) {
        const fields = [];
        const vals = [];
        let i=1;
        for (const k of ['nom','type','config','actif']){
            if (data[k]!==undefined){ fields.push(`${k}=$${i}`); vals.push(k==='config'?JSON.stringify(data[k]):data[k]); i++; }
        }
        if (fields.length===0) return this.findById(id);
        vals.push(id);
        const q = `UPDATE prestataires SET ${fields.join(',')} WHERE id=$${i} RETURNING *`;
        const res = await pgPool.query(q, vals);
        return res.rows[0]||null;
    }
}

module.exports = new PrestataireRepository();