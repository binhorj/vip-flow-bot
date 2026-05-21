const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas de agendamentos requerem autenticação
router.use(authMiddleware);

/**
 * GET /api/schedules
 * Lista agendamentos de uma campanha
 * Query: ?campaignId={id}
 */
router.get('/', scheduleController.listSchedules);

/**
 * POST /api/schedules
 * Cria novo agendamento
 * Body: {
 *   campaignId,
 *   photoId,
 *   captionId,
 *   link,
 *   scheduledAt (YYYY-MM-DDTHH:mm:ss)
 * }
 */
router.post('/', scheduleController.createSchedule);

/**
 * GET /api/schedules/:id
 * Busca agendamento específico
 */
router.get('/:id', scheduleController.getSchedule);

/**
 * PUT /api/schedules/:id
 * Atualiza agendamento
 * Body: { scheduledAt?, link? }
 */
router.put('/:id', scheduleController.updateSchedule);

/**
 * DELETE /api/schedules/:id
 * Cancela agendamento
 */
router.delete('/:id', scheduleController.deleteSchedule);

/**
 * POST /api/schedules/:id/run-now
 * Executa agendamento manualmente (TEST_MODE only)
 * Para testes de scheduler e timezone
 */
router.post('/:id/run-now', scheduleController.runNow);

module.exports = router;
