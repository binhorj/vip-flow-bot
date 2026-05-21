const express = require('express');
const router = express.Router();
const telegramController = require('../controllers/telegramController');
const authMiddleware = require('../middleware/auth');

/**
 * Rotas de teste e controle do Telegram
 * IMPORTANTE: Algumas rotas NÃO requerem autenticação para facilitar testes
 */

/**
 * GET /api/telegram/validate
 * Valida se o token do Telegram está correto
 * Não requer autenticação
 */
router.get('/validate', telegramController.validateToken);

/**
 * POST /api/telegram/test-message
 * Envia uma mensagem de teste
 * Body: { chatId, message? }
 * Não requer autenticação
 */
router.post('/test-message', telegramController.sendTestMessage);

/**
 * POST /api/telegram/test-photo
 * Envia uma foto de teste
 * Body: { chatId, photoUrl, caption, link }
 * Não requer autenticação
 */
router.post('/test-photo', telegramController.sendTestPhoto);

/**
 * GET /api/telegram/scheduler/status
 * Retorna status do scheduler
 * Requer autenticação
 */
router.get('/scheduler/status', authMiddleware, telegramController.getSchedulerStatus);

/**
 * POST /api/telegram/scheduler/start
 * Inicia o scheduler
 * Requer autenticação
 */
router.post('/scheduler/start', authMiddleware, telegramController.startScheduler);

/**
 * POST /api/telegram/scheduler/stop
 * Para o scheduler
 * Requer autenticação
 */
router.post('/scheduler/stop', authMiddleware, telegramController.stopScheduler);

/**
 * POST /api/telegram/schedule/execute
 * Executa um agendamento manualmente (para testes)
 * Body: { scheduleId }
 * Requer autenticação
 */
router.post('/schedule/execute', authMiddleware, telegramController.executeScheduleNow);

module.exports = router;
