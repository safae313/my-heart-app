const statistiqueService = require('../services/statistiqueService');

class StatistiqueController {
    async period(req,res,next){
        try{
            const rows = await statistiqueService.periodStats(req.query.debut, req.query.fin);
            res.json({success:true,data:rows});
        }catch(e){next(e);}    }
    async chiffre(req,res,next){
        try{
            const rows = await statistiqueService.chiffreAffaires(req.query.periode);
            res.json({success:true,data:rows});
        }catch(e){next(e);}    }
}

module.exports = new StatistiqueController();