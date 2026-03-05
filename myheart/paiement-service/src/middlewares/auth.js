const jwt = require('jsonwebtoken');
const { UserRole } = require('../utils/constants');

const authenticateToken = (req,res,next)=>{
    try{
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if(!token) return res.status(401).json({success:false,message:'Token manquant'});
        jwt.verify(token, process.env.JWT_SECRET, (err,user)=>{
            if(err) return res.status(403).json({success:false,message:'Token invalide'});
            req.user = user; next();
        });
    }catch(e){console.error(e);res.status(500).json({success:false,message:'Erreur auth'});}    
};

const requireRoles = (roles)=>{
    return (req,res,next)=>{
        if(!req.user) return res.status(401).json({success:false,message:'Non authentifié'});
        if(!roles.includes(req.user.role)) return res.status(403).json({success:false,message:'Accès interdit'});
        next();
    };
};

module.exports = { authenticateToken, requireRoles };