const serviceService = require('../services/serviceMedicalService');

class ServiceMedicalController{
    async create(req,res,next){ try{ const created = await serviceService.create(req.body, req.user); res.status(201).json({success:true,data:created}); }catch(e){next(e);} }
    async listByDepartement(req,res,next){ try{ const list = await serviceService.listByDepartement(parseInt(req.params.departementId)); res.json({success:true,data:list}); }catch(e){next(e);} }
    async get(req,res,next){ try{ const s = await serviceService.get(parseInt(req.params.id)); if(!s) return res.status(404).json({success:false}); res.json({success:true,data:s}); }catch(e){next(e);} }
    async update(req,res,next){ try{ const u = await serviceService.update(parseInt(req.params.id), req.body, req.user); res.json({success:true,data:u}); }catch(e){next(e);} }
    async delete(req,res,next){ try{ await serviceService.delete(parseInt(req.params.id), req.user); res.json({success:true,message:'Deleted'}); }catch(e){next(e);} }
}

module.exports = new ServiceMedicalController();