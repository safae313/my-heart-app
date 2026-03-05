const rateLimit = require('express-rate-limit');

// stronger limiter for payment endpoints
function createLimiter(windowMs, max){
    return rateLimit({ windowMs, max, standardHeaders:true, legacyHeaders:false });
}

module.exports = { createLimiter };