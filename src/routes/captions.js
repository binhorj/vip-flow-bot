const express = require('express');
const router = express.Router();
const captionController = require('../controllers/captionController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas de legendas requerem autenticação
router.use(authMiddleware);

/**
 * GET /api/captions
 * Lista legendas do usuário
 * Query: ?category=soft (opcional)
 */
router.get('/', captionController.listCaptions);

/**
 * POST /api/captions
 * Cria nova legenda
 * Body: { text, category }
 * category: soft, curiosity, exclusivity, urgency, cta
 */
router.post('/', captionController.createCaption);

/**
 * GET /api/captions/:id
 * Busca legenda específica
 */
router.get('/:id', captionController.getCaption);

/**
 * PUT /api/captions/:id
 * Atualiza legenda
 * Body: { text, category }
 */
router.put('/:id', captionController.updateCaption);

/**
 * DELETE /api/captions/:id
 * Deleta legenda
 */
router.delete('/:id', captionController.deleteCaption);

module.exports = router;
