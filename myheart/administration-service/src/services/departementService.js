const departRepo = require('../repositories/departementRepository');
const auditService = require('./auditService');

class DepartementService {
    async create(data, user){
        const created = await departRepo.create(data);
        await auditService.log({ user_id: user.id, action: 'departement:create', resource_type: 'departement', resource_id: created.id, details: created });
        return created;
    }

    async listByHospital(hospitalId){ return await departRepo.findByHospital(hospitalId); }

    async get(id){ return await departRepo.findById(id); }

    async update(id, data, user){
        const updated = await departRepo.update(id, data);
        await auditService.log({ user_id: user.id, action: 'departement:update', resource_type: 'departement', resource_id: id, details: data });
        return updated;
    }

    async delete(id, user){
        const deleted = await departRepo.delete(id);
        await auditService.log({ user_id: user.id, action: 'departement:delete', resource_type: 'departement', resource_id: id });
        return deleted;
    }

    async assignChief(id, chefId, user){
        const updated = await departRepo.assignChief(id, chefId);
        await auditService.log({ user_id: user.id, action: 'departement:assign_chief', resource_type: 'departement', resource_id: id, details:{chef:chefId} });
        return updated;
    }
}

module.exports = new DepartementService();