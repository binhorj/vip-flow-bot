const Schedule = require('../models/Schedule');
const Campaign = require('../models/Campaign');
const Metric = require('../models/Metric');
const logger = require('../utils/logger');
const { isValidDate, isValidUrl } = require('../utils/validators');
const schedulerService = require('../services/schedulerService');
const testModeService = require('../services/testModeService');

/**
 * Lista agendamentos de uma campanha
 */
const listSchedules = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { campaignId } = req.query;

    // Se tem ID de campanha, valida se pertence ao usuário
    if (campaignId) {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign || campaign.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Campanha não encontrada'
        });
      }
      const schedules = await Schedule.findByCampaignId(campaignId);
      return res.status(200).json({
        success: true,
        count: schedules.length,
        schedules: schedules
      });
    }

    res.status(400).json({
      success: false,
      message: 'campaignId é obrigatório'
    });
  } catch (error) {
    logger.error('Erro ao listar agendamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar agendamentos'
    });
  }
};

/**
 * Cria novo agendamento
 */
const createSchedule = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { campaignId, photoId, captionId, link, scheduledAt } = req.body;

    // LOG: Payload recebido
    logger.info(`📅 [SCHEDULE CREATE] Payload recebido:`);
    logger.info(`   - userId: ${userId}`);
    logger.info(`   - campaignId: ${campaignId}`);
    logger.info(`   - photoId: ${photoId}`);
    logger.info(`   - captionId: ${captionId}`);
    logger.info(`   - link: ${link}`);
    logger.info(`   - scheduledAt: ${scheduledAt}`);

    // Validações
    if (!campaignId || !photoId || !captionId || !link || !scheduledAt) {
      logger.warn(`⚠️ [SCHEDULE CREATE] Campo obrigatório faltando`);
      return res.status(400).json({
        success: false,
        message: 'campaignId, photoId, captionId, link e scheduledAt são obrigatórios'
      });
    }

    if (!isValidUrl(link)) {
      logger.warn(`⚠️ [SCHEDULE CREATE] Link inválido: ${link}`);
      return res.status(400).json({
        success: false,
        message: 'Link inválido'
      });
    }

    if (!isValidDate(scheduledAt)) {
      logger.warn(`⚠️ [SCHEDULE CREATE] Data inválida: ${scheduledAt}`);
      return res.status(400).json({
        success: false,
        message: 'Data inválida (use: YYYY-MM-DDTHH:mm:ss)'
      });
    }

    // Valida se campanha pertence ao usuário
    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.user_id !== userId) {
      logger.warn(`⚠️ [SCHEDULE CREATE] Campanha não encontrada ou sem permissão: ${campaignId}`);
      return res.status(403).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    // Valida se não está no passado
    // IMPORTANTE: datetime-local vem sem timezone, então interpretamos como local
    const scheduledDate = new Date(scheduledAt);
    const nowLocal = new Date();

    logger.info(`⏰ [SCHEDULE CREATE] Validação de data/hora:`);
    logger.info(`   - scheduledAt bruto: ${scheduledAt}`);
    logger.info(`   - scheduledDate interpretado: ${scheduledDate.toISOString()}`);
    logger.info(`   - horário local atual: ${nowLocal.toISOString()}`);
    logger.info(`   - diferença (ms): ${scheduledDate.getTime() - nowLocal.getTime()}`);

    if (scheduledDate <= nowLocal) {
      logger.warn(`⚠️ [SCHEDULE CREATE] Tentativa de agendar para o passado: ${scheduledAt}`);
      return res.status(400).json({
        success: false,
        message: 'Não pode agendar para o passado'
      });
    }

    // Converte para ISO string para salvar de forma consistente no SQLite
    const scheduledAtISO = scheduledDate.toISOString();

    // Cria agendamento
    logger.info(`📅 [SCHEDULE CREATE] Inserindo no banco...`);
    logger.info(`   - scheduledAt ISO (para DB): ${scheduledAtISO}`);
    const scheduleId = await Schedule.create(campaignId, photoId, captionId, link, scheduledAtISO);

    // Cria métrica inicial
    await Metric.create(scheduleId, 'pending');

    logger.info(`✅ [SCHEDULE CREATE] Agendamento criado: ${scheduleId} para ${scheduledAt}`);

    res.status(201).json({
      success: true,
      message: 'Agendamento criado com sucesso',
      schedule: {
        id: scheduleId,
        campaignId: campaignId,
        photoId: photoId,
        captionId: captionId,
        link: link,
        scheduledAt: scheduledAt,
        status: 'pending'
      }
    });
  } catch (error) {
    logger.error(`❌ [SCHEDULE CREATE] Erro ao criar agendamento:`);
    logger.error(`   Mensagem: ${error.message}`);
    logger.error(`   Stack: ${error.stack}`);
    logger.error(`   SQL Error Code: ${error.code}`);

    res.status(500).json({
      success: false,
      message: 'Erro ao criar agendamento',
      error: error.message
    });
  }
};

/**
 * Busca agendamento por ID
 */
const getSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    // Valida se a campanha pertence ao usuário
    const campaign = await Campaign.findById(schedule.campaign_id);
    if (!campaign || campaign.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para acessar este agendamento'
      });
    }

    res.status(200).json({
      success: true,
      schedule: schedule
    });
  } catch (error) {
    logger.error('Erro ao buscar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar agendamento'
    });
  }
};

/**
 * Atualiza agendamento
 */
const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { scheduledAt, link } = req.body;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    // Valida permissão
    const campaign = await Campaign.findById(schedule.campaign_id);
    if (!campaign || campaign.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para editar este agendamento'
      });
    }

    // Não pode editar se já foi enviado
    if (schedule.is_sent) {
      return res.status(400).json({
        success: false,
        message: 'Não pode editar agendamento já enviado'
      });
    }

    // Validações
    if (scheduledAt && !isValidDate(scheduledAt)) {
      logger.warn(`⚠️ [SCHEDULE UPDATE] Data inválida: ${scheduledAt}`);
      return res.status(400).json({
        success: false,
        message: 'Data inválida'
      });
    }

    if (link && !isValidUrl(link)) {
      logger.warn(`⚠️ [SCHEDULE UPDATE] Link inválido: ${link}`);
      return res.status(400).json({
        success: false,
        message: 'Link inválido'
      });
    }

    // Converte data para ISO se fornecida
    let finalScheduledAt = schedule.scheduled_at;
    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      finalScheduledAt = scheduledDate.toISOString();
      logger.info(`⏰ [SCHEDULE UPDATE] Data convertida: ${scheduledAt} → ${finalScheduledAt}`);
    }

    // Atualiza
    await Schedule.update(id, finalScheduledAt, link || schedule.link);

    res.status(200).json({
      success: true,
      message: 'Agendamento atualizado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar agendamento'
    });
  }
};

/**
 * Deleta agendamento
 */
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    // Valida permissão
    const campaign = await Campaign.findById(schedule.campaign_id);
    if (!campaign || campaign.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para deletar este agendamento'
      });
    }

    // Não pode deletar se já foi enviado
    if (schedule.is_sent) {
      return res.status(400).json({
        success: false,
        message: 'Não pode deletar agendamento já enviado'
      });
    }

    // Deleta
    await Schedule.delete(id);

    res.status(200).json({
      success: true,
      message: 'Agendamento cancelado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar agendamento'
    });
  }
};

/**
 * Executa agendamento manualmente (TEST_MODE only)
 * Endpoint para testes de scheduler e timezone
 */
const runNow = async (req, res) => {
  try {
    // Verifica TEST_MODE
    if (!process.env.TEST_MODE || process.env.TEST_MODE !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'Este endpoint só está disponível em TEST_MODE'
      });
    }

    const { id } = req.params;
    const userId = req.user.userId;

    logger.info(`🚀 [RUN-NOW] Solicitação para executar agendamento ${id}`);

    // Busca agendamento
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      logger.warn(`⚠️ [RUN-NOW] Agendamento não encontrado: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    // Valida permissão
    const campaign = await Campaign.findById(schedule.campaign_id);
    if (!campaign || campaign.user_id !== userId) {
      logger.warn(`⚠️ [RUN-NOW] Sem permissão para executar: ${id}`);
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para executar este agendamento'
      });
    }

    // Valida se já foi enviado
    if (schedule.is_sent) {
      logger.warn(`⚠️ [RUN-NOW] Agendamento já foi enviado: ${id}`);
      return res.status(400).json({
        success: false,
        message: 'Este agendamento já foi enviado'
      });
    }

    // Log detalhado com TEST_MODE
    const now = new Date();
    const scheduledDate = new Date(schedule.scheduled_at);
    const diffMs = now.getTime() - scheduledDate.getTime();
    const diffMinutes = Math.round(diffMs / 60000);
    const isTestMode = testModeService.isTestMode();
    const modeLabel = isTestMode ? '🧪 TESTE' : '🚀 PRODUÇÃO';

    logger.info(`${modeLabel} [RUN-NOW] Executando manualmente:`);
    logger.info(`   - TEST_MODE: ${isTestMode}`);
    logger.info(`   - ID: ${schedule.id}`);
    logger.info(`   - scheduled_at: ${schedule.scheduled_at}`);
    logger.info(`   - horário atual: ${now.toISOString()}`);
    logger.info(`   - atraso: ${diffMinutes} minuto(s)`);

    // Executa usando o serviço
    const result = await schedulerService.executeScheduleNow(id);

    logger.info(`✅ [RUN-NOW] Agendamento executado com sucesso: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Agendamento executado manualmente',
      schedule: {
        id: schedule.id,
        campaignId: schedule.campaign_id,
        photoId: schedule.photo_id,
        scheduledAt: schedule.scheduled_at,
        status: 'sent'
      }
    });
  } catch (error) {
    logger.error(`❌ [RUN-NOW] Erro ao executar agendamento:`, error);
    logger.error(`   Mensagem: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao executar agendamento',
      error: error.message
    });
  }
};

module.exports = {
  listSchedules,
  createSchedule,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  runNow
};
