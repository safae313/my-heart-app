const { Pool } = require('pg');

// ==================== CONFIGURATION POSTGRESQL ====================

const pgPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ordonnance_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pgPool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Erreur de connexion PostgreSQL (ordonnance) :', err.stack);
    }
    console.log('✅ Connecté à PostgreSQL (service Ordonnance)');
    release();
});

// ==================== INITIALISATION DES TABLES ====================

async function initializeDatabase() {
    const client = await pgPool.connect();
    try {
        console.log('📦 Création des tables ordonnances & prescriptions...');

        // Table ordonnances
        await client.query(`
            CREATE TABLE IF NOT EXISTS ordonnances (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER NOT NULL,
                medecin_id INTEGER NOT NULL,
                date_prescription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                date_validite DATE,
                statut VARCHAR(20) NOT NULL DEFAULT 'active',
                diagnostic TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT statut_valide CHECK (statut IN ('active','expirée','utilisée'))
            );
        `);

        // Table prescriptions
        await client.query(`
            CREATE TABLE IF NOT EXISTS prescriptions (
                id SERIAL PRIMARY KEY,
                ordonnance_id INTEGER REFERENCES ordonnances(id) ON DELETE CASCADE,
                medicament_id INTEGER NOT NULL,
                medicament_nom VARCHAR(200),
                dosage VARCHAR(100),
                duree_traitement VARCHAR(100),
                posologie TEXT,
                quantite INTEGER,
                renouvelable BOOLEAN DEFAULT false,
                instructions TEXT
            );
        `);

        // Indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_ordonnances_patient ON ordonnances(patient_id);
            CREATE INDEX IF NOT EXISTS idx_ordonnances_medecin ON ordonnances(medecin_id);
            CREATE INDEX IF NOT EXISTS idx_ordonnances_statut ON ordonnances(statut);
            CREATE INDEX IF NOT EXISTS idx_prescriptions_ordonnance ON prescriptions(ordonnance_id);
        `);

        // Trigger pour mettre à jour updated_at
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
            DROP TRIGGER IF EXISTS update_ordonnances_updated_at ON ordonnances;
            CREATE TRIGGER update_ordonnances_updated_at
                BEFORE UPDATE ON ordonnances
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);

        console.log('✅ Tables et indexes ordonnances prêtes');
    } catch (err) {
        console.error('❌ Erreur lors de l\'initialisation de la base :', err);
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    pgPool,
    initializeDatabase
};