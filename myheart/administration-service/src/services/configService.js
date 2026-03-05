const configRepo = require('../repositories/configRepository');
const auditService = require('./auditService');

class ConfigService {
    async getAll(){ return await configRepo.getAll(); }
    async upsert(key, value, user){
        const res = await configRepo.upsert(key, value);
        await auditService.log({ user_id: user.id, action: 'config:update', resource_type: 'config', details: { key, value } });
        return res;
    }
}

module.exports = new ConfigService();