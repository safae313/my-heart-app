const jwt = require('jsonwebtoken');

/**
 * Middleware pour vérifier le token JWT
 */
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token manquant' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ success: false, message: 'Token invalide ou expiré' });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Erreur auth middleware :', error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'authentification' });
    }
};

/**
 * Middleware pour vérifier les rôles
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Accès interdit - rôle insuffisant' });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    checkRole
};