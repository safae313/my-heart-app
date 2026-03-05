require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./models/db');
const ordonnanceRoutes = require('./routes/ordonnanceRoutes');

const app = express();

// middlewares globaux
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par IP
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// routes
app.use('/api/ordonnances', ordonnanceRoutes);

// health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// gestion erreurs simples
app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message || 'Erreur serveur' });
});

const PORT = process.env.PORT || 3004;

initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Service Ordonnance démarré sur le port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Impossible de démarrer le service :', err);
        process.exit(1);
    });