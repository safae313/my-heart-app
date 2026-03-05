require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./models/db');
const adminRoutes = require('./routes/adminRoutes');
const { registerToConsul } = require('./consul');
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// strict rate limit for admin
const limiter = rateLimit({ windowMs: 15*60*1000, max: 200, standardHeaders: true, legacyHeaders: false });
app.use(limiter);

app.use('/api/admin', adminRoutes);

app.get('/health', (req,res) => res.status(200).json({ status: 'ok' }));

app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ success:false, message: err.message || 'Erreur serveur' });
});

const PORT = process.env.PORT || 3010;

initializeDatabase()
    .then(()=>{
        registerToConsul('administration-service', 3010);
        app.listen(PORT, ()=> console.log(`🚀 Administration service started on ${PORT}`));
    })
    .catch(err=>{ console.error('Unable to start service', err); process.exit(1); });