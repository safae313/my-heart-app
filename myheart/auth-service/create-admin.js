const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'auth_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
});

async function createAdmin() {
    try {
        // Vérifier si admin existe déjà
        const check = await pool.query(
            "SELECT * FROM users WHERE email = 'admin@myheart.com'"
        );
        
        if (check.rows.length > 0) {
            console.log('❌ Un admin existe déjà avec cet email');
            console.log('   ID:', check.rows[0].id);
            return;
        }
        
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(`
            INSERT INTO users (nom, prenom, email, "motDePasse", role, telephone, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING id, email, role
        `, ['Admin', 'Super', 'admin@myheart.com', hashedPassword, 'admin', '0612345680']);
        
        console.log('✅ Admin créé avec succès !');
        console.log('📧 Email:', result.rows[0].email);
        console.log('🔑 Mot de passe:', password);
        console.log('🆔 ID:', result.rows[0].id);
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await pool.end();
    }
}

createAdmin();