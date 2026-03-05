const serviceRepo = require('../repositories/serviceMedicalRepository');
const auditService = require('./auditService');

class ServiceMedicalService {
    async create(data, user){
        const created = await serviceRepo.create(data);
        await auditService.log({ user_id: user.id, action: 'service:create', resource_type: 'service', resource_id: created.id, details: created });
        return created;
    }

    async listByDepartement(departementId){ return await serviceRepo.findByDepartement(departementId); }

    async get(id){ return await serviceRepo.findById(id); }

    async update(id, data, user){
        const updated = await serviceRepo.update(id, data);
        await auditService.log({ user_id: user.id, action: 'service:update', resource_type: 'service', resource_id: id, details: data });
        return updated;
    }

    async delete(id, user){
        const deleted = await serviceRepo.delete(id);
        await auditService.log({ user_id: user.id, action: 'service:delete', resource_type: 'service', resource_id: id });
        return deleted;
    }
}

module.exports = new ServiceMedicalService();