const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas de campanhas requerem autenticação
router.use(authMiddleware);

/**
 * GET /api/campaigns
 * Lista todas as campanhas do usuário
 */
router.get('/', campaignController.listCampaigns);

/**
 * POST /api/campaigns
 * Cria nova campanha
 * Body: { name, startDate?, endDate? }
 */
router.post('/', campaignController.createCampaign);

/**
 * GET /api/campaigns/:id
 * Busca campanha específica
 */
router.get('/:id', campaignController.getCampaign);

/**
 * PUT /api/campaigns/:id
 * Atualiza campanha
 * Body: { name, startDate?, endDate? }
 */
router.put('/:id', campaignController.updateCampaign);

/**
 * PATCH /api/campaigns/:id/status
 * Muda status da campanha
 * Body: { status } - active, paused, completed
 */
router.patch('/:id/status', campaignController.updateStatus);

/**
 * DELETE /api/campaigns/:id
 * Deleta campanha
 */
router.delete('/:id', campaignController.deleteCampaign);

module.exports = router;
