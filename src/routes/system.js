const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const authMiddleware = require('../middleware/auth');

/**
 * GET /api/system/status
 * Status público do sistema (sem autenticação)
 */
router.get('/status', systemController.getStatus);

/**
 * GET /api/system/config
 * Configuração (requer autenticação)
 */
router.get('/config', authMiddleware, systemController.getConfig);

module.exports = router;
