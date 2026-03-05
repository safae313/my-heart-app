const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const app = express();
const authRoutes = require('./routes/auth.routes');

// ─── MIDDLEWARES DE SÉCURITÉ ───
app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── ROUTES ───
app.use('/auth', authRoutes);

// ─── ROUTE DE TEST ───
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'auth-service',
    timestamp: new Date()
  });
});

// ─── DÉMARRAGE DU SERVEUR ───
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connecté avec succès');
    
    await sequelize.sync({ force: false });
    console.log('✅ Tables synchronisées');

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`✅ Auth Service démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur connexion PostgreSQL:', error);
    process.exit(1);
  }
};

startServer();
module.exports = app;
