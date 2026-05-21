const telegramService = require('../services/telegramService');
const schedulerService = require('../services/schedulerService');
const logger = require('../utils/logger');

/**
 * Valida configuração do Telegram
 */
const validateToken = async (req, res) => {
  try {
    // Tenta obter informações do bot
    const botInfo = await telegramService.getMe();

    res.status(200).json({
      success: true,
      message: 'Token do Telegram é válido',
      botInfo: {
        id: botInfo.result.id,
        isBot: botInfo.result.is_bot,
        name: botInfo.result.first_name,
        username: botInfo.result.username
      }
    });
  } catch (error) {
    logger.error('Erro ao validar token:', error);
    res.status(400).json({
      success: false,
      message: 'Token inválido ou bot não encontrado',
      error: error.message
    });
  }
};

/**
 * Envia mensagem de teste
 * Útil para validar configuração
 */
const sendTestMessage = async (req, res) => {
  try {
    const { chatId, message } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'chatId é obrigatório'
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'message é obrigatório'
      });
    }

    const testMsg = message || '✅ Conexão com Telegram funcionando!';

    await telegramService.sendMessage(chatId, testMsg);

    res.status(200).json({
      success: true,
      message: 'Mensagem de teste enviada com sucesso',
      chatId: chatId
    });
  } catch (error) {
    logger.error('Erro ao enviar mensagem de teste:', error);
    res.status(400).json({
      success: false,
      message: 'Erro ao enviar mensagem',
      error: error.message
    });
  }
};

/**
 * Envia foto de teste
 * Para validar se fotos estão funcionando
 */
const sendTestPhoto = async (req, res) => {
  try {
    const { chatId, photoUrl, caption, link } = req.body;

    if (!chatId || !photoUrl || !caption || !link) {
      return res.status(400).json({
        success: false,
        message: 'chatId, photoUrl, caption e link são obrigatórios'
      });
    }

    await telegramService.sendPhoto(chatId, photoUrl, caption, link);

    res.status(200).json({
      success: true,
      message: 'Foto de teste enviada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao enviar foto de teste:', error);
    res.status(400).json({
      success: false,
      message: 'Erro ao enviar foto',
      error: error.message
    });
  }
};

/**
 * Retorna status do scheduler
 */
const getSchedulerStatus = async (req, res) => {
  try {
    const status = schedulerService.getStatus();

    res.status(200).json({
      success: true,
      scheduler: status
    });
  } catch (error) {
    logger.error('Erro ao obter status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter status do scheduler'
    });
  }
};

/**
 * Inicia o scheduler manualmente
 */
const startScheduler = async (req, res) => {
  try {
    schedulerService.startScheduler();

    res.status(200).json({
      success: true,
      message: 'Scheduler iniciado'
    });
  } catch (error) {
    logger.error('Erro ao iniciar scheduler:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao iniciar scheduler'
    });
  }
};

/**
 * Para o scheduler manualmente
 */
const stopScheduler = async (req, res) => {
  try {
    schedulerService.stopScheduler();

    res.status(200).json({
      success: true,
      message: 'Scheduler parado'
    });
  } catch (error) {
    logger.error('Erro ao parar scheduler:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao parar scheduler'
    });
  }
};

/**
 * Executa um agendamento manualmente (para testes)
 */
const executeScheduleNow = async (req, res) => {
  try {
    const { scheduleId } = req.body;

    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message: 'scheduleId é obrigatório'
      });
    }

    const result = await schedulerService.executeScheduleNow(scheduleId);

    res.status(200).json({
      success: true,
      message: result.message,
      scheduleId: scheduleId
    });
  } catch (error) {
    logger.error('Erro ao executar agendamento:', error);
    res.status(400).json({
      success: false,
      message: 'Erro ao executar agendamento',
      error: error.message
    });
  }
};

module.exports = {
  validateToken,
  sendTestMessage,
  sendTestPhoto,
  getSchedulerStatus,
  startScheduler,
  stopScheduler,
  executeScheduleNow
};
