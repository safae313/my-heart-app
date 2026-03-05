const remboursementService = require('../services/remboursementService');

class RemboursementController {
    async request(req,res,next){
        try{
            const { montant, raison } = req.body;
            const reqr = await remboursementService.request(parseInt(req.params.id), montant, raison);
            res.status(201).json({success:true,data:reqr});
        }catch(e){next(e);}    }
    async process(req,res,next){
        try{
            const updated = await remboursementService.process(parseInt(req.params.id), req.body.statut);
            res.json({success:true,data:updated});
        }catch(e){next(e);} }
    async history(req,res,next){
        try{ const rows = await remboursementService.history(parseInt(req.params.patientId)); res.json({success:true,data:rows}); }catch(e){next(e);} }
}

module.exports = new RemboursementController();