const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// ==================== MIDDLEWARES ====================
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// ==================== ROUTES ====================
app.use('/api/auth', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' }
}));

app.use('/api/rendezvous', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/rendezvous': '' }
}));

app.use('/api/dossier', createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: { '^/api/dossier': '' }
}));

app.use('/api/ordonnance', createProxyMiddleware({
  target: 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: { '^/api/ordonnance': '' }
}));

app.use('/api/analyse', createProxyMiddleware({
  target: 'http://localhost:3005',
  changeOrigin: true,
  pathRewrite: { '^/api/analyse': '' }
}));

app.use('/api/paiement', createProxyMiddleware({
  target: 'http://localhost:3007',
  changeOrigin: true,
  pathRewrite: { '^/api/paiement': '' }
}));

app.use('/api/administration', createProxyMiddleware({
  target: 'http://localhost:3010',
  changeOrigin: true,
  pathRewrite: { '^/api/administration': '' }
}));

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway is running 🚀' });
});

// ==================== START ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway démarré sur le port ${PORT}`);
});

module.exports = app;