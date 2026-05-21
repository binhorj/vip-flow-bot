const testModeService = require('../services/testModeService');
const schedulerService = require('../services/schedulerService');
const logger = require('../utils/logger');

/**
 * Controller para status do sistema
 */

/**
 * GET /api/system/status
 * Retorna status completo do sistema
 */
const getStatus = async (req, res) => {
  try {
    const status = testModeService.getStatus();
    const schedulerStatus = schedulerService.getStatus();

    res.status(200).json({
      success: true,
      system: {
        mode: status.mode,
        modeLabel: status.modeLabel,
        testModeActive: status.testMode,
        warning: status.warning,
        environment: status.environment,
        timestamp: new Date().toISOString()
      },
      telegram: {
        botTokenConfigured: status.telegramBotToken === '✅ Configurado',
        testChatConfigured: status.testChatConfigured,
        productionChatConfigured: status.productionChatConfigured,
        currentChatId: status.currentChatId
      },
      scheduler: {
        running: schedulerStatus.running,
        status: schedulerStatus.running ? '✅ Ativo' : '⏸️ Parado',
        lastCheck: schedulerStatus.lastCheck,
        interval: '30 segundos'
      },
      antiSpam: {
        enabled: true,
        cooldown: 30,
        unit: 'segundos'
      }
    });
  } catch (error) {
    logger.error('Erro ao obter status do sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter status',
      error: error.message
    });
  }
};

/**
 * GET /api/system/config
 * Retorna configuração (apenas para admin)
 */
const getConfig = async (req, res) => {
  try {
    const status = testModeService.getStatus();

    // Oculta valores sensíveis
    res.status(200).json({
      success: true,
      testMode: status.testMode,
      environment: status.environment,
      mode: status.mode,
      hasTestChat: status.testChatConfigured,
      hasProductionChat: status.productionChatConfigured,
      hasBotToken: status.telegramBotToken === '✅ Configurado'
    });
  } catch (error) {
    logger.error('Erro ao obter configuração:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter configuração'
    });
  }
};

module.exports = {
  getStatus,
  getConfig
};
