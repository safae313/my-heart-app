const auditRepo = require('../repositories/auditRepository');

class AuditService {
    async log(entry){
        return await auditRepo.log(entry);
    }

    async query(filters){
        return await auditRepo.query(filters);
    }
}

module.exports = new AuditService();