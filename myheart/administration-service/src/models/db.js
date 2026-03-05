const { Pool } = require('pg');

const pgPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'administration_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pgPool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Erreur de connexion PostgreSQL (administration) :', err.stack);
    }
    console.log('✅ Connecté à PostgreSQL (service Administration)');
    release();
});

async function initializeDatabase() {
    const client = await pgPool.connect();
    try {
        console.log('📦 Création des tables administration...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS hopitaux (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(200) NOT NULL,
                adresse TEXT,
                ville VARCHAR(100),
                code_postal VARCHAR(20),
                telephone VARCHAR(20),
                email VARCHAR(200),
                type VARCHAR(50),
                actif BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS departements (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(200) NOT NULL,
                description TEXT,
                hospital_id INTEGER REFERENCES hopitaux(id) ON DELETE CASCADE,
                chef_departement_id INTEGER,
                actif BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS services_medical (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(200) NOT NULL,
                description TEXT,
                departement_id INTEGER REFERENCES departements(id) ON DELETE CASCADE,
                responsable_id INTEGER,
                actif BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS roles_et_droits (
                id SERIAL PRIMARY KEY,
                role VARCHAR(50) NOT NULL,
                permission VARCHAR(100) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS logs_audit (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                action VARCHAR(100) NOT NULL,
                resource_type VARCHAR(50),
                resource_id INTEGER,
                details JSONB,
                ip_address VARCHAR(50),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_departements_hospital ON departements(hospital_id);
            CREATE INDEX IF NOT EXISTS idx_services_departement ON services_medical(departement_id);
            CREATE INDEX IF NOT EXISTS idx_logs_user ON logs_audit(user_id);
            CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs_audit(timestamp);
        `);

        // Trigger function for updated_at
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
            DROP TRIGGER IF EXISTS update_hopitaux_updated_at ON hopitaux;
            CREATE TRIGGER update_hopitaux_updated_at
                BEFORE UPDATE ON hopitaux
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);

        await client.query(`
            DROP TRIGGER IF EXISTS update_departements_updated_at ON departements;
            CREATE TRIGGER update_departements_updated_at
                BEFORE UPDATE ON departements
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);

        await client.query(`
            DROP TRIGGER IF EXISTS update_services_updated_at ON services_medical;
            CREATE TRIGGER update_services_updated_at
                BEFORE UPDATE ON services_medical
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);

        console.log('✅ Tables et indexes administration prêtes');
    } catch (err) {
        console.error('❌ Erreur lors de l\'initialisation de la base :', err);
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { pgPool, initializeDatabase };