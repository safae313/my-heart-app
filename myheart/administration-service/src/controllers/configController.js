const configService = require('../services/configService');

class ConfigController{
    async list(req,res,next){ try{ const rows = await configService.getAll(); res.json({success:true,data:rows}); }catch(e){next(e);} }
    async upsert(req,res,next){ try{ const { key, value } = req.body; const resu = await configService.upsert(key, value, req.user); res.json({success:true,data:resu}); }catch(e){next(e);} }
}

module.exports = new ConfigController();