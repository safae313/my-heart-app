const factureService = require('../services/factureService');

class FactureController {
    async create(req,res,next){
        try{
            const facture = await factureService.generate(req.body);
            res.status(201).json({success:true,data:facture});
        }catch(e){next(e);}    }
    async listByPatient(req,res,next){
        try{ const rows = await factureService.listByPatient(parseInt(req.params.patientId)); res.json({success:true,data:rows}); }catch(e){next(e);} }
    async get(req,res,next){
        try{ const f = await factureService.get(parseInt(req.params.id)); if(!f) return res.status(404).json({success:false}); res.json({success:true,data:f}); }catch(e){next(e);} }
    async updateStatut(req,res,next){
        try{ const u = await factureService.updateStatus(parseInt(req.params.id), req.body.statut); res.json({success:true,data:u}); }catch(e){next(e);} }
    async pdf(req,res,next){
        try{
            const pdf = await factureService.pdf(parseInt(req.params.id));
            if(!pdf) return res.status(404).json({success:false});
            res.setHeader('Content-Type','application/pdf');
            res.send(pdf);
        }catch(e){next(e);} }
}
module.exports = new FactureController();