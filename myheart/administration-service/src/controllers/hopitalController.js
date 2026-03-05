const hopitalService = require('../services/hopitalService');

class HopitalController{
    async create(req,res,next){
        try{
            const created = await hopitalService.create(req.body, req.user);
            res.status(201).json({ success:true, data: created });
        }catch(e){ next(e);}    }
    async list(req,res,next){ try{ const rows = await hopitalService.list(); res.json({ success:true, data: rows }); }catch(e){next(e);} }
    async get(req,res,next){ try{ const h = await hopitalService.get(parseInt(req.params.id)); if(!h) return res.status(404).json({success:false,message:'Not found'}); res.json({success:true,data:h}); }catch(e){next(e);} }
    async update(req,res,next){ try{ const updated = await hopitalService.update(parseInt(req.params.id), req.body, req.user); res.json({success:true,data:updated}); }catch(e){next(e);} }
    async remove(req,res,next){ try{ await hopitalService.remove(parseInt(req.params.id), req.user); res.json({success:true,message:'Deleted'}); }catch(e){next(e);} }
    async activate(req,res,next){ try{ const active = req.body.actif; const updated = await hopitalService.activate(parseInt(req.params.id), active, req.user); res.json({success:true,data:updated}); }catch(e){next(e);} }
    async stats(req,res,next){ try{ const s = await hopitalService.stats(parseInt(req.params.id)); res.json({success:true,data:s}); }catch(e){next(e);} }
}

module.exports = new HopitalController();