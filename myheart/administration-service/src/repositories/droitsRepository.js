const { pgPool } = require('../models/db');

class DroitsRepository {
    async listAll() {
        const res = await pgPool.query('SELECT * FROM roles_et_droits ORDER BY role');
        return res.rows;
    }

    async addPermission(role, permission, description) {
        const res = await pgPool.query('INSERT INTO roles_et_droits (role, permission, description) VALUES ($1,$2,$3) RETURNING *', [role, permission, description||null]);
        return res.rows[0];
    }

    async findPermissionsByRole(role) {
        const res = await pgPool.query('SELECT * FROM roles_et_droits WHERE role=$1', [role]);
        return res.rows;
    }

    async checkUserPermission(userId, permission) {
        // This requires calling Auth service to get roles for user. Placeholder: return false.
        return false;
    }
}

module.exports = new DroitsRepository();