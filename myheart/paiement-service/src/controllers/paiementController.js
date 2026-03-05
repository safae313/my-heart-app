const paiementService = require('../services/paiementService');

class PaiementController {
    async pay(req,res,next){
        try{
            const payment = await paiementService.pay(req.body);
            res.status(201).json({success:true,data:payment});
        }catch(e){next(e);}    }
    async history(req,res,next){
        try{ const rows = await paiementService.history(parseInt(req.params.patientId)); res.json({success:true,data:rows}); }catch(e){next(e);} }
    async status(req,res,next){
        try{ const p = await paiementService.getStatus(parseInt(req.params.id)); if(!p) return res.status(404).json({success:false}); res.json({success:true,data:p}); }catch(e){next(e);} }
}
module.exports = new PaiementController();