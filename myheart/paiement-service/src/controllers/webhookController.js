// Placeholder: simply accept and log

class WebhookController {
    async handle(req,res,next){
        try{
            console.log('webhook', req.params.prestataire, req.body);
            res.json({received:true});
        }catch(e){next(e);}    }
}

module.exports = new WebhookController();