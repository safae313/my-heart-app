require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const dossierRoutes = require('./routes/dossierRoutes');
const { registerToConsul } = require('./consul');
const app = express();

// middlewares globaux
app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});
app.use(limiter);

// health check
app.get('/health', (req, res) => {
    res.json({ success: true, message: 'Service dossier médical en ligne' });
});

// routes
app.use('/api/dossiers', dossierRoutes);

// gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erreur interne du serveur'
    });
});

// connexion à la BDD et démarrage du serveur
const PORT = process.env.PORT || 3003;

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connecté à MongoDB');
        registerToConsul('dossier-service', 3003);
        app.listen(PORT, () => {
            console.log(`Serveur dossier-service démarré sur le port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Erreur de connexion MongoDB :', err);
        process.exit(1);
    });

module.exports = app;
