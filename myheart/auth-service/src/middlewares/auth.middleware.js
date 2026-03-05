const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // 1. Récupérer le token dans le header
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  // 2. Extraire le token (enlever "Bearer ")
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token invalide' });
  }

  // 3. Vérifier le token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token expiré ou invalide' });
  }
};

module.exports = { verifyToken };