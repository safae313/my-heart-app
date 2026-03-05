const { v4: uuidv4 } = require('uuid');
const cache = {}; // simple in-memory map; in production use redis

module.exports = (req,res,next)=>{
    const key = req.headers['idempotency-key'];
    if(!key){
        // generate one and attach
        req.idempotencyKey = uuidv4();
        return next();
    }
    req.idempotencyKey = key;
    if(cache[key]){
        // return previous response
        const { status, body } = cache[key];
        return res.status(status).json(body);
    }
    // wrap res.json to store
    const originalJson = res.json.bind(res);
    res.json = (body)=>{
        cache[key]={status:res.statusCode, body};
        return originalJson(body);
    };
    next();
};