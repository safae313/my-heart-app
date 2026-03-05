const jwt = require('jsonwebtoken');
const { redisClient } = require('../models/db');

/**
 * Middleware pour vérifier le token JWT
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Récupérer le token du header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Token manquant' 
            });
        }
        
        // Vérifier si le token est blacklisté (logout)
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ 
                success: false,
                message: 'Token invalide (session expirée)' 
            });
        }
        
        // Vérifier et décoder le token
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
          if (err) {
        // 👇 AJOUTE CES LOGS
          console.log('❌ Erreur JWT détaillée:');
          console.log('   - Nom:', err.name);
          console.log('   - Message:', err.message);
          console.log('   - Expiré?:', err.name === 'TokenExpiredError');
        
          if (err.name === 'TokenExpiredError') {
            console.log('   - Expiré depuis:', err.expiredAt);
           }
        
          return res.status(403).json({ 
            success: false,
            message: 'Token invalide ou expiré',
            error: err.name,  // 👈 AJOUTE ÇA AUSSI POUR VOIR DANS POSTMAN
            details: err.message
          });
        }
    
    console.log('✅ Token valide pour:', user.email, 'role:', user.role);
    req.user = user;
    next();
});
        
    } catch (error) {
        console.error('Erreur auth middleware:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de l\'authentification' 
        });
    }
};

/**
 * Middleware pour vérifier les rôles
 * @param {Array} allowedRoles - Liste des rôles autorisés
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Non authentifié' 
            });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: 'Accès interdit - rôle insuffisant' 
            });
        }
        
        next();
    };
};

/**
 * Middleware optionnel - vérifie le token si présent mais ne bloque pas
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return next();
        }
        
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (!err) {
                req.user = user;
            }
            next();
        });
        
    } catch (error) {
        next(); // On continue même en cas d'erreur
    }
};

module.exports = {
    authenticateToken,
    checkRole,
    optionalAuth
};