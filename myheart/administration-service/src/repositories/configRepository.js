const { pgPool } = require('../models/db');

class ConfigRepository {
    async getAll() {
        const res = await pgPool.query('SELECT * FROM configuration');
        return res.rows;
    }

    async upsert(key, value) {
        // simple key/value table expected
        await pgPool.query(`INSERT INTO configuration (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [key, JSON.stringify(value)]);
        return { key, value };
    }
}

module.exports = new ConfigRepository();