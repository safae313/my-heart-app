const departService = require('../services/departementService');

class DepartementController{
    async create(req,res,next){ try{ const created = await departService.create(req.body, req.user); res.status(201).json({success:true,data:created}); }catch(e){next(e);} }
    async listByHospital(req,res,next){ try{ const list = await departService.listByHospital(parseInt(req.params.hospitalId)); res.json({success:true,data:list}); }catch(e){next(e);} }
    async get(req,res,next){ try{ const d = await departService.get(parseInt(req.params.id)); if(!d) return res.status(404).json({success:false}); res.json({success:true,data:d}); }catch(e){next(e);} }
    async update(req,res,next){ try{ const u = await departService.update(parseInt(req.params.id), req.body, req.user); res.json({success:true,data:u}); }catch(e){next(e);} }
    async delete(req,res,next){ try{ const d = await departService.delete(parseInt(req.params.id), req.user); res.json({success:true,message:'Deleted'}); }catch(e){next(e);} }
    async assignChief(req,res,next){ try{ const id = parseInt(req.params.id); const chef = req.body.chef_departement_id; const u = await departService.assignChief(id, chef, req.user); res.json({success:true,data:u}); }catch(e){next(e);} }
}

module.exports = new DepartementController();