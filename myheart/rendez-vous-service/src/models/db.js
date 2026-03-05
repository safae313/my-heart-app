const { Pool } = require('pg');
const redis = require('redis'); // ← DÉCOMMENTE

// ==================== CONFIGURATION POSTGRESQL ====================

const pgPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'rendezvous_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'safae',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pgPool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Erreur de connexion PostgreSQL:', err.stack);
    }
    console.log('✅ Connecté à PostgreSQL (service Rendez-vous)');
    release();
});

// ==================== CONFIGURATION REDIS (ACTIVÉE) ====================

// Création du client Redis
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.log('❌ Trop de tentatives de reconnexion Redis');
                return new Error('Trop de tentatives');
            }
            return Math.min(retries * 100, 3000);
        }
    }
});

// Gestionnaire d'événements Redis
redisClient.on('connect', () => {
    console.log('✅ Connecté à Redis (service Rendez-vous)');
});

redisClient.on('ready', () => {
    console.log('🚀 Redis prêt à recevoir des commandes');
});

redisClient.on('error', (err) => {
    console.error('❌ Erreur Redis:', err);
});

redisClient.on('end', () => {
    console.log('📴 Connexion Redis fermée');
});

// Connexion à Redis (version asynchrone)
(async () => {
    try {
        await redisClient.connect();
        console.log('📦 Cache Redis activé avec succès');
        
        // Test simple pour vérifier
        await redisClient.set('test:connection', 'OK');
        const test = await redisClient.get('test:connection');
        console.log(`🧪 Test Redis: ${test}`);
        
    } catch (err) {
        console.error('❌ Échec connexion Redis:', err);
        console.log('⚠️ Le service continuera sans cache Redis');
    }
})();

// Supprime ou commente la version simulée qu'on avait mise
/* const redisClient = {
    get: async () => null,
    setEx: async () => {},
    ...
}; */

// ==================== FONCTIONS D'INITIALISATION ====================

async function initializeDatabase() {
    const client = await pgPool.connect();
    
    try {
        console.log('📦 Création des tables...');
        
        // Création de la table des rendez-vous
        await client.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER NOT NULL,
                medecin_id INTEGER NOT NULL,
                hospital_id INTEGER NOT NULL,
                date_heure TIMESTAMP NOT NULL,
                statut VARCHAR(20) NOT NULL DEFAULT 'en_attente',
                motif TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                -- Contraintes
                CONSTRAINT valid_statut CHECK (statut IN ('en_attente', 'confirmé', 'annulé', 'terminé')),
                CONSTRAINT date_future CHECK (date_heure > CURRENT_TIMESTAMP)
            );
        `);
        
        console.log('✅ Table appointments créée/vérifiée');
        
        // Création de la table des disponibilités des médecins
        await client.query(`
            CREATE TABLE IF NOT EXISTS schedules (
                id SERIAL PRIMARY KEY,
                medecin_id INTEGER NOT NULL,
                hospital_id INTEGER NOT NULL,
                date_disponible DATE NOT NULL,
                heure_debut TIME NOT NULL,
                heure_fin TIME NOT NULL,
                est_disponible BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                -- Contraintes
                CONSTRAINT heure_valide CHECK (heure_debut < heure_fin),
                UNIQUE(medecin_id, date_disponible, heure_debut)
            );
        `);
        
        console.log('✅ Table schedules créée/vérifiée');
        
        // Index pour améliorer les performances
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
            CREATE INDEX IF NOT EXISTS idx_appointments_medecin ON appointments(medecin_id);
            CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date_heure);
            CREATE INDEX IF NOT EXISTS idx_appointments_statut ON appointments(statut);
            CREATE INDEX IF NOT EXISTS idx_schedules_medecin_date ON schedules(medecin_id, date_disponible);
        `);
        
        console.log('✅ Index créés/vérifiés');
        
        // Trigger pour updated_at
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
        
        await client.query(`
            DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
            CREATE TRIGGER update_appointments_updated_at
                BEFORE UPDATE ON appointments
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
        
        console.log('✅ Trigger créé/vérifié');
        console.log('✅ Toutes les tables sont prêtes !');
        
    } catch (err) {
        console.error('❌ Erreur lors de la création des tables:', err);
        throw err;
    } finally {
        client.release();
    }
}

// ==================== EXPORTS ====================

module.exports = {
    pgPool,
    redisClient,
    initializeDatabase
};