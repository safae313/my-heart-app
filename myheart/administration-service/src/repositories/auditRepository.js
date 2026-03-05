const { pgPool } = require('../models/db');

class AuditRepository {
    async log(entry) {
        const q = `INSERT INTO logs_audit (user_id, action, resource_type, resource_id, details, ip_address) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
        const vals = [entry.user_id||null, entry.action, entry.resource_type||null, entry.resource_id||null, entry.details?JSON.stringify(entry.details):null, entry.ip_address||null];
        const res = await pgPool.query(q, vals);
        return res.rows[0];
    }

    async query(filters={}){
        // simple filtering
        const where = [];
        const vals = [];
        let i=1;
        if (filters.user_id){ where.push(`user_id=$${i++}`); vals.push(filters.user_id); }
        if (filters.action){ where.push(`action ILIKE $${i++}`); vals.push('%'+filters.action+'%'); }
        if (filters.date_from){ where.push(`timestamp >= $${i++}`); vals.push(filters.date_from); }
        if (filters.date_to){ where.push(`timestamp <= $${i++}`); vals.push(filters.date_to); }
        const q = `SELECT * FROM logs_audit ${where.length? 'WHERE '+where.join(' AND '):''} ORDER BY timestamp DESC LIMIT 1000`;
        const res = await pgPool.query(q, vals);
        return res.rows;
    }
}

module.exports = new AuditRepository();