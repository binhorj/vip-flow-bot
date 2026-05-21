const Schedule = require('../models/Schedule');
const Photo = require('../models/Photo');
const telegramService = require('./telegramService');
const testModeService = require('./testModeService');
const logger = require('../utils/logger');

/**
 * Serviço de agendamento
 * Executa postagens no horário configurado
 */

let schedulerRunning = false;
let schedulerInterval = null;

/**
 * Inicia o scheduler
 * Verifica a cada 30 segundos por agendamentos pendentes
 */
const startScheduler = () => {
  if (schedulerRunning) {
    logger.warn('Scheduler já está rodando');
    return;
  }

  schedulerRunning = true;
  logger.info('🚀 Scheduler iniciado - verificando agendamentos a cada 30s');

  // Executa imediatamente na primeira vez
  processScheduledPosts();

  // Depois executa a cada 30 segundos
  schedulerInterval = setInterval(processScheduledPosts, 30000);
};

/**
 * Para o scheduler
 */
const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    schedulerRunning = false;
    logger.info('⏹️ Scheduler parado');
  }
};

/**
 * Busca e processa agendamentos pendentes
 * Comparação de datas feita em JavaScript, não em SQL
 */
const processScheduledPosts = async () => {
  try {
    const now = new Date();
    const nowMs = now.getTime();

    logger.debug(`🔔 [SCHEDULER] Verificando agendamentos`);
    logger.debug(`   - horário atual: ${now.toISOString()}`);
    logger.debug(`   - timestamp (ms): ${nowMs}`);

    // Busca TODOS os agendamentos não-enviados (sem filtro de data em SQL)
    // A comparação é feita aqui em JavaScript
    const allUnsent = await Schedule.findAllUnsent();

    logger.debug(`🔔 [SCHEDULER] Agendamentos não-enviados no banco: ${allUnsent.length}`);

    // Filtra apenas os que têm data <= agora
    const pendingSchedules = allUnsent.filter(schedule => {
      const scheduledDate = new Date(schedule.scheduled_at);
      const scheduledMs = scheduledDate.getTime();
      return scheduledMs <= nowMs;
    });

    logger.debug(`🔔 [SCHEDULER] Agendamentos com data <= agora: ${pendingSchedules.length}`);

    if (pendingSchedules.length === 0) {
      return; // Nada a fazer
    }

    // Processa cada agendamento
    for (const schedule of pendingSchedules) {
      try {
        const scheduledDate = new Date(schedule.scheduled_at);
        const diffMs = now.getTime() - scheduledDate.getTime();
        const diffMinutes = Math.round(diffMs / 60000);
        const diffSeconds = Math.round(diffMs / 1000);

        logger.info(`🔔 [SCHEDULER] Processando agendamento ${schedule.id}:`);
        logger.info(`   - scheduled_at (bruto): "${schedule.scheduled_at}"`);
        logger.info(`   - scheduled_at (interpretado): ${scheduledDate.toISOString()}`);
        logger.info(`   - timestamp (scheduled): ${scheduledDate.getTime()}`);
        logger.info(`   - horário atual: ${now.toISOString()}`);
        logger.info(`   - timestamp (now): ${now.getTime()}`);
        logger.info(`   - atraso: ${diffMinutes}min (${diffSeconds}s)`);
        logger.info(`   - foto: ${schedule.photo_url}`);

        await processSingleSchedule(schedule);
      } catch (error) {
        logger.error(`❌ Erro ao processar agendamento ${schedule.id}:`, error);
        // Continua processando os próximos
      }
    }
  } catch (error) {
    logger.error('❌ Erro ao processar agendamentos:', error);
  }
};

/**
 * Processa um agendamento individual
 */
const processSingleSchedule = async (schedule) => {
  try {
    // Obtém chat ID correto baseado em TEST_MODE
    const isTestMode = testModeService.isTestMode();
    const chatId = testModeService.validateChatId();
    const modeLabel = isTestMode ? '🧪 TESTE' : '🚀 PRODUÇÃO';

    logger.info(`${modeLabel} Enviando agendamento ID ${schedule.id}:`);
    logger.info(`   - chat_id: ${chatId}`);
    logger.info(`   - photo_url: ${schedule.photo_url}`);
    logger.info(`   - caption: "${schedule.caption_text.substring(0, 50)}..."`);

    // Envia a postagem
    await telegramService.sendScheduledPost({
      id: schedule.id,
      chat_id: chatId,
      photo_url: schedule.photo_url,
      caption_text: schedule.caption_text,
      link: schedule.link
    });

    // Marca como enviado
    await Schedule.markAsSent(schedule.id);

    // Registra uso da foto para sistema de variedade
    try {
      await Photo.updateUsage(schedule.photo_id);
      logger.info(`📊 Foto ${schedule.photo_id} - uso registrado para variedade`);
    } catch (photoError) {
      logger.warn(`⚠️ Erro ao registrar uso da foto: ${photoError.message}`);
      // Não falha o agendamento se não conseguir atualizar stats
    }

    logger.info(`✅ ${modeLabel} Agendamento ${schedule.id} enviado com sucesso!`);
  } catch (error) {
    // Registra erro mas não para o scheduler
    logger.error(`❌ Erro ao enviar agendamento ${schedule.id}:`, error.message);

    // Tratamento especial para erros de configuração
    if (error.message.includes('TEST_CHAT_ID')) {
      logger.warn('⚠️ Em TEST_MODE: TELEGRAM_TEST_CHAT_ID é obrigatório!');
    } else if (error.message.includes('PRODUCTION_CHAT_ID')) {
      logger.warn('⚠️ Em PRODUÇÃO: TELEGRAM_PRODUCTION_CHAT_ID é obrigatório!');
    } else if (error.message.includes('Token')) {
      logger.warn('⚠️ Problema: TELEGRAM_BOT_TOKEN não configurado ou inválido');
    }

    // Continua processando próximos agendamentos
  }
};

/**
 * Retorna status do scheduler
 */
const getStatus = () => {
  return {
    running: schedulerRunning,
    message: schedulerRunning ? 'Scheduler está ativo' : 'Scheduler parado'
  };
};

/**
 * Agenda um agendamento manualmente (para testes)
 */
const executeScheduleNow = async (scheduleId) => {
  try {
    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      throw new Error('Agendamento não encontrado');
    }

    if (schedule.is_sent) {
      throw new Error('Este agendamento já foi enviado');
    }

    // Obtém chat ID correto baseado em TEST_MODE
    const isTestMode = testModeService.isTestMode();
    const chatId = testModeService.validateChatId();
    const modeLabel = isTestMode ? '🧪 TESTE' : '🚀 PRODUÇÃO';

    logger.info(`🚀 ${modeLabel} Executando agendamento ${scheduleId} manualmente`);
    logger.info(`   - chat_id: ${chatId}`);

    await telegramService.sendScheduledPost({
      id: schedule.id,
      chat_id: chatId,
      photo_url: schedule.photo_url,
      caption_text: schedule.caption_text,
      link: schedule.link
    });

    await Schedule.markAsSent(scheduleId);

    logger.info(`✅ ${modeLabel} Agendamento ${scheduleId} executado com sucesso`);

    return {
      success: true,
      message: 'Agendamento executado com sucesso'
    };
  } catch (error) {
    logger.error('❌ Erro ao executar agendamento:', error.message);
    throw error;
  }
};

module.exports = {
  startScheduler,
  stopScheduler,
  getStatus,
  processScheduledPosts,
  executeScheduleNow
};
