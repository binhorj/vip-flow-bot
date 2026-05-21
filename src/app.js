const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const schedulerService = require('./services/schedulerService');

// Importa rotas
const authRoutes = require('./routes/auth');
const photoRoutes = require('./routes/photos');
const captionRoutes = require('./routes/captions');
const campaignRoutes = require('./routes/campaigns');
const scheduleRoutes = require('./routes/schedules');
const metricRoutes = require('./routes/metrics');
const telegramRoutes = require('./routes/telegram');
const marketingRoutes = require('./routes/marketing');
const systemRoutes = require('./routes/system');

// Cria aplicação Express
const app = express();

// ===== MIDDLEWARE =====

// Habilita CORS (permite requisições do frontend)
app.use(cors());

// Permite JSON no body das requisições
app.use(express.json());

// Permite acesso a arquivos estáticos (uploads, painel HTML/CSS/JS)
app.use(express.static('public'));

// Rota para servir o índice do painel (login)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/login.html'));
});

// Atalhos para páginas do painel
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/dashboard.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/dashboard.html'));
});

app.get('/photos.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/photos.html'));
});

app.get('/campaigns.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/campaigns.html'));
});

app.get('/history.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/history.html'));
});

app.get('/settings.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/settings.html'));
});

// Logger de requisições
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// ===== ROTAS =====

// Rota de health check (útil para validar se API está funcionando)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API VIP FLOW BOT está funcionando!',
    timestamp: new Date().toISOString(),
    schedulerStatus: schedulerService.getStatus()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/captions', captionRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/system', systemRoutes);

// ===== ROTA 404 =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// ===== HANDLER DE ERROS =====
app.use(errorHandler);

module.exports = app;
