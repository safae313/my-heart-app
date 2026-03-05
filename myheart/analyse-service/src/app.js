require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./models/db');
const analyseRoutes = require('./routes/analyseRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

app.use('/api/analyses', analyseRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message || 'Erreur serveur' });
});

const PORT = process.env.PORT || 3005;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Service Analyses démarré sur le port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Impossible de démarrer le service :', err);
        process.exit(1);
    });