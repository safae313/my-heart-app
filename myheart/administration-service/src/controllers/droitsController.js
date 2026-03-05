const droitsService = require('../services/droitsService');

class DroitsController{
    async list(req,res,next){ try{ const rows = await droitsService.listAll(); res.json({success:true,data:rows}); }catch(e){next(e);} }
    async add(req,res,next){ try{ const { role, permission, description } = req.body; const created = await droitsService.addPermission(role, permission, description, req.user); res.status(201).json({success:true,data:created}); }catch(e){next(e);} }
    async byRole(req,res,next){ try{ const rows = await droitsService.findByRole(req.params.role); res.json({success:true,data:rows}); }catch(e){next(e);} }
}

module.exports = new DroitsController();