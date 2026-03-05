const rateLimit = require('express-rate-limit');

// Limiteur spécifique pour les routes sensibles
const sensitiveRoutesLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requêtes max
    message: {
        success: false,
        message: 'Trop de tentatives, réessayez plus tard.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiteur pour les routes de lecture
const readRoutesLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requêtes par minute
    message: {
        success: false,
        message: 'Trop de requêtes, ralentissez.'
    }
});

// Middleware pour logger les requêtes (utile en développement)
const requestLogger = (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`📨 ${req.method} ${req.url} - ${new Date().toISOString()}`);
    }
    next();
};

// Middleware pour vérifier le content-type
const checkContentType = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        if (!req.is('application/json')) {
            return res.status(415).json({
                success: false,
                message: 'Content-Type doit être application/json'
            });
        }
    }
    next();
};

module.exports = {
    sensitiveRoutesLimiter,
    readRoutesLimiter,
    requestLogger,
    checkContentType
};