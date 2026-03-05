// ==================== IMPORTS ====================
// 1. D'abord dotenv pour charger les variables d'environnement
require('dotenv').config();

// 2. Ensuite les modules externes
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
 
// 3. Ensuite les modules internes (qui peuvent utiliser process.env)
const { initializeDatabase } = require('./models/db');
const appointmentRoutes = require('./routes/appointmentRoutes');
const { authenticateToken } = require('./middlewares/auth');
const { registerToConsul } = require('./consul');
// ==================== INITIALISATION ====================
const app = express();

// ==================== MIDDLEWARES GLOBAUX ====================

// 1. Helmet : sécurise les en-têtes HTTP
app.use(helmet());

// 2. CORS : permet à d'autres domaines d'accéder à l'API
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://mondomaine.com'] 
        : 'http://localhost:3000',
    credentials: true
}));

// 3. Rate limiting : limite le nombre de requêtes par IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite à 100 requêtes par windowMs
    message: {
        success: false,
        message: 'Trop de requêtes, réessayez plus tard.'
    }
});
app.use('/api', limiter);

// 4. Parsing du JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES ====================

// Route de santé pour vérifier que le service tourne
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        service: 'rendezvous',
        timestamp: new Date().toISOString()
    });
});

// Routes de l'API (protégées par authentification)
app.use('/api/appointments', authenticateToken, appointmentRoutes);

// ==================== GESTION DES ERREURS ====================

// 404 - Route non trouvée
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Route non trouvée' 
    });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
    console.error('❌ Erreur:', err.stack);
    
    // Erreur de validation JWT
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ 
            success: false,
            message: 'Token invalide ou expiré' 
        });
    }
    
    // Erreur de validation (Joi)
    if (err.isJoi) {
        return res.status(400).json({ 
            success: false,
            message: 'Erreur de validation',
            details: err.details 
        });
    }
    
    // Erreurs personnalisées avec status
    if (err.status) {
        return res.status(err.status).json({ 
            success: false,
            message: err.message 
        });
    }
    
    // Erreur serveur par défaut
    res.status(500).json({ 
        success: false,
        message: 'Erreur interne du serveur',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
});

// ==================== DÉMARRAGE ====================

const PORT = process.env.PORT || 3002;

// Vérifier que les variables d'environnement sont chargées
console.log('📋 Variables d\'environnement chargées:');
console.log('- PORT:', process.env.PORT);
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_NAME:', process.env.DB_NAME);
console.log('- DB_USER:', process.env.DB_USER);
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '✓ présent' : '✗ manquant');
console.log('- NODE_ENV:', process.env.NODE_ENV);

if (require.main === module) {
    // D'abord initialiser la BDD, puis démarrer le serveur
    initializeDatabase()
        .then(() => {
            registerToConsul('rendez-vous-service', 3002);
            app.listen(PORT, () => {
                console.log(`\n🚀 ===================================`);
                console.log(`✅ Service Rendez-vous démarré avec succès !`);
                console.log(`📌 Port: ${PORT}`);
                console.log(`🔗 URL: http://localhost:${PORT}`);
                console.log(`📝 Environnement: ${process.env.NODE_ENV || 'development'}`);
                console.log(`====================================\n`);
            });
        })
        .catch(err => {
            console.error('❌ Échec du démarrage:', err.message);
            console.error('💡 Vérifie que:');
            console.error('   1. PostgreSQL tourne');
            console.error('   2. Le mot de passe dans .env est correct');
            console.error('   3. La base de données "rendezvous_db" existe');
            process.exit(1);
        });
}

module.exports = app;