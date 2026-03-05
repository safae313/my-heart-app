const hopitalRepo = require('../repositories/hopitalRepository');
const auditService = require('./auditService');
const { ErrorMessages } = require('../utils/constants');

class HopitalService {
    async create(h, user) {
        const created = await hopitalRepo.create(h);
        await auditService.log({ user_id: user.id, action: 'hopital:create', resource_type: 'hopital', resource_id: created.id, details: created });
        return created;
    }

    async list() { return await hopitalRepo.findAll(); }

    async get(id) { return await hopitalRepo.findById(id); }

    async update(id, data, user) {
        const updated = await hopitalRepo.update(id, data);
        await auditService.log({ user_id: user.id, action: 'hopital:update', resource_type: 'hopital', resource_id: id, details: data });
        return updated;
    }

    async remove(id, user) {
        const deleted = await hopitalRepo.delete(id);
        await auditService.log({ user_id: user.id, action: 'hopital:delete', resource_type: 'hopital', resource_id: id });
        return deleted;
    }

    async activate(id, active, user) {
        const updated = await hopitalRepo.update(id, { actif: active });
        await auditService.log({ user_id: user.id, action: `hopital:${active?'activate':'deactivate'}`, resource_type: 'hopital', resource_id: id });
        return updated;
    }

    async stats(id) { return await hopitalRepo.statsByHopital(id); }
}

module.exports = new HopitalService();