const Campaign = require('../models/Campaign');
const Schedule = require('../models/Schedule');
const logger = require('../utils/logger');
const { isValidDate, isValidCampaignStatus } = require('../utils/validators');

/**
 * Lista campanhas do usuário
 */
const listCampaigns = async (req, res) => {
  try {
    const userId = req.user.userId;

    const campaigns = await Campaign.findByUserId(userId);

    res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns: campaigns
    });
  } catch (error) {
    logger.error('Erro ao listar campanhas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar campanhas'
    });
  }
};

/**
 * Cria nova campanha
 */
const createCampaign = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, startDate, endDate } = req.body;

    // Validações
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório'
      });
    }

    if (name.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Nome deve ter pelo menos 3 caracteres'
      });
    }

    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Data de início inválida (use: YYYY-MM-DD)'
      });
    }

    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Data de término inválida (use: YYYY-MM-DD)'
      });
    }

    // Cria campanha
    const campaignId = await Campaign.create(userId, name, startDate || null, endDate || null);

    res.status(201).json({
      success: true,
      message: 'Campanha criada com sucesso',
      campaign: {
        id: campaignId,
        name: name,
        status: 'active',
        startDate: startDate,
        endDate: endDate
      }
    });
  } catch (error) {
    logger.error('Erro ao criar campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar campanha'
    });
  }
};

/**
 * Busca campanha por ID
 */
const getCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    // Valida se pertence ao usuário
    if (campaign.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para acessar esta campanha'
      });
    }

    // Conta agendamentos
    const scheduleCount = await Schedule.countByCampaignId(id);

    res.status(200).json({
      success: true,
      campaign: campaign,
      scheduleCount: scheduleCount
    });
  } catch (error) {
    logger.error('Erro ao buscar campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar campanha'
    });
  }
};

/**
 * Atualiza campanha
 */
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { name, startDate, endDate } = req.body;

    // Valida se pertence ao usuário
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    if (campaign.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para editar esta campanha'
      });
    }

    // Validações
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório'
      });
    }

    // Atualiza
    await Campaign.update(id, name, startDate || null, endDate || null);

    res.status(200).json({
      success: true,
      message: 'Campanha atualizada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao atualizar campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar campanha'
    });
  }
};

/**
 * Muda status da campanha (active, paused, completed)
 */
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { status } = req.body;

    // Valida se pertence ao usuário
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    if (campaign.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para editar esta campanha'
      });
    }

    // Valida status
    if (!status || !isValidCampaignStatus(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido: active, paused, completed'
      });
    }

    // Atualiza
    await Campaign.updateStatus(id, status);

    res.status(200).json({
      success: true,
      message: `Campanha ${status} com sucesso`
    });
  } catch (error) {
    logger.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status'
    });
  }
};

/**
 * Deleta campanha
 */
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Valida se pertence ao usuário
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    if (campaign.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para deletar esta campanha'
      });
    }

    // Deleta
    await Campaign.delete(id);

    res.status(200).json({
      success: true,
      message: 'Campanha deletada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar campanha'
    });
  }
};

module.exports = {
  listCampaigns,
  createCampaign,
  getCampaign,
  updateCampaign,
  updateStatus,
  deleteCampaign
};
