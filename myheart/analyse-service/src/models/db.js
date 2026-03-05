const mongoose = require('mongoose');

async function connectDB() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/analyses_db';
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connecté à MongoDB (service Analyses)');
    } catch (err) {
        console.error('❌ Erreur de connexion MongoDB :', err);
        throw err;
    }
}

module.exports = { connectDB };