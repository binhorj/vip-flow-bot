const express = require('express');
const router = express.Router();
const metricController = require('../controllers/metricController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas de métricas requerem autenticação
router.use(authMiddleware);

/**
 * GET /api/metrics/history
 * Retorna histórico de publicações
 * Query: ?limit=50&offset=0
 */
router.get('/history', metricController.getHistory);

/**
 * GET /api/metrics/stats
 * Retorna estatísticas gerais
 * Respostas: totalSent, totalFailed, totalPending, totalMetrics, successRate
 */
router.get('/stats', metricController.getStats);

/**
 * GET /api/metrics/errors
 * Retorna erros recentes
 * Query: ?limit=20
 */
router.get('/errors', metricController.getErrors);

module.exports = router;
