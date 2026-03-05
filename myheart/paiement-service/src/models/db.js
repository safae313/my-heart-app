const { Pool } = require('pg');

const pgPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'paiement_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pgPool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Erreur de connexion PostgreSQL (paiement) :', err.stack);
    }
    console.log('✅ Connecté à PostgreSQL (service Paiement)');
    release();
});

async function initializeDatabase() {
    const client = await pgPool.connect();
    try {
        console.log('📦 Création des tables paiements...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS factures (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER NOT NULL,
                consultation_id INTEGER,
                ordonnance_id INTEGER,
                analyse_id INTEGER,
                numero_facture VARCHAR(50) UNIQUE NOT NULL,
                date_emission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                date_echeance DATE,
                montant_total DECIMAL(10,2) NOT NULL,
                montant_remboursement DECIMAL(10,2) DEFAULT 0,
                reste_a_charge DECIMAL(10,2) NOT NULL,
                statut VARCHAR(20) DEFAULT 'emise',
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS paiements (
                id SERIAL PRIMARY KEY,
                facture_id INTEGER REFERENCES factures(id),
                patient_id INTEGER NOT NULL,
                montant DECIMAL(10,2) NOT NULL,
                methode VARCHAR(50) NOT NULL,
                reference_transaction VARCHAR(100),
                statut VARCHAR(20) DEFAULT 'en_attente',
                date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                dernier_statut_check TIMESTAMP,
                tentative_number INTEGER DEFAULT 1,
                metadata JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS remboursements (
                id SERIAL PRIMARY KEY,
                paiement_id INTEGER REFERENCES paiements(id),
                facture_id INTEGER REFERENCES factures(id),
                montant DECIMAL(10,2) NOT NULL,
                raison VARCHAR(255),
                statut VARCHAR(20) DEFAULT 'en_attente',
                date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                date_effet DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS prestataires (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                type VARCHAR(50),
                config JSONB,
                actif BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_factures_patient ON factures(patient_id);
            CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut);
            CREATE INDEX IF NOT EXISTS idx_factures_date ON factures(date_emission);
            CREATE INDEX IF NOT EXISTS idx_paiements_facture ON paiements(facture_id);
            CREATE INDEX IF NOT EXISTS idx_paiements_statut ON paiements(statut);
            CREATE INDEX IF NOT EXISTS idx_paiements_date ON paiements(date_paiement);
        `);

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
            DROP TRIGGER IF EXISTS update_factures_updated_at ON factures;
            CREATE TRIGGER update_factures_updated_at
                BEFORE UPDATE ON factures
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);

        console.log('✅ Tables paiements prêtes');
    } catch (err) {
        console.error('❌ Erreur initialisation base:', err);
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { pgPool, initializeDatabase };