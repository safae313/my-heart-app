require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./models/db');
const paiementRoutes = require('./routes/paiementRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// global rate limiter
const limiter = rateLimit({ windowMs: 15*60*1000, max: 200, standardHeaders:true, legacyHeaders:false });
app.use(limiter);

app.use('/api/paiements', paiementRoutes);
app.get('/health', (req,res)=>res.status(200).json({status:'ok'}));

app.use((err,req,res,next)=>{
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({success:false,message:err.message||'Erreur serveur'});
});

const PORT = process.env.PORT || 3007;

initializeDatabase()
    .then(()=>{
        app.listen(PORT, ()=>console.log(`🚀 Paiement service on ${PORT}`));
    })
    .catch(err=>{console.error('Cannot start', err); process.exit(1);});