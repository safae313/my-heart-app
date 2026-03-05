const auditService = require('../services/auditService');

// audit middleware: log user, method, path, body
module.exports = async (req, res, next) => {
    try{
        const user = req.user || {};
        const entry = {
            user_id: user.id || null,
            action: `${req.method.toLowerCase()}:${req.path}`,
            resource_type: 'admin',
            resource_id: null,
            details: { body: req.body },
            ip_address: req.ip || req.headers['x-forwarded-for'] || null
        };
        await auditService.log(entry);
    }catch(err){ console.error('audit log failed', err); }
    next();
};