const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const authMiddleware = require('../middleware/auth');

/**
 * Rotas de marketing
 * Sistema inteligente de sugestões e combos
 */

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * GET /api/marketing/info
 * Informações sobre o sistema de marketing
 * Retorna: total de legendas, estratégias, call levels, dicas
 */
router.get('/info', marketingController.getInfo);

/**
 * GET /api/marketing/captions
 * Busca legendas por estratégia
 * Query: ?strategy=curiosidade&count=5
 * Estratégias: curiosidade, exclusividade, urgencia, oferta, novidade, suave, cta
 */
router.get('/captions', marketingController.getCaptions);

/**
 * GET /api/marketing/suggestions
 * Sugestões inteligentes baseadas em nível de chamada
 * Query: ?callLevel=medio&count=3
 * Níveis: suave, medio, direto
 */
router.get('/suggestions', marketingController.getSuggestions);

/**
 * POST /api/marketing/generate-combo
 * Gera combo automático: foto + legenda + estratégia
 * Body: {
 *   photoId,
 *   campaignId,
 *   callLevel: 'medio',
 *   strategy?: 'curiosidade',
 *   customLink?: 'https://seu-link.com'
 * }
 */
router.post('/generate-combo', marketingController.generateCombo);

module.exports = router;
