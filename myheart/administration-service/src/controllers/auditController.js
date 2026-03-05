const auditService = require('../services/auditService');

class AuditController{
    async query(req,res,next){
        try{
            const filters = {
                user_id: req.query.user_id ? parseInt(req.query.user_id) : undefined,
                action: req.query.action,
                date_from: req.query.date_from,
                date_to: req.query.date_to
            };
            const rows = await auditService.query(filters);
            res.json({success:true,data:rows});
        }catch(e){next(e);}    }
}

module.exports = new AuditController();