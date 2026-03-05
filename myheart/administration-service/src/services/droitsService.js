const droitsRepo = require('../repositories/droitsRepository');
const auditService = require('./auditService');

class DroitsService {
    async listAll(){ return await droitsRepo.listAll(); }
    async addPermission(role, permission, description, user){
        const created = await droitsRepo.addPermission(role, permission, description);
        await auditService.log({ user_id: user.id, action: 'droits:add_permission', resource_type: 'droits', resource_id: created.id, details: created });
        return created;
    }
    async findByRole(role){ return await droitsRepo.findPermissionsByRole(role); }
}

module.exports = new DroitsService();