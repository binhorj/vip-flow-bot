const captionLibrary = require('../utils/captionLibrary');
const Photo = require('../models/Photo');
const Caption = require('../models/Caption');
const Campaign = require('../models/Campaign');
const logger = require('../utils/logger');
const { isValidMarketingStrategy, isValidCallLevel, isValidPhotoType } = require('../utils/validators');

/**
 * Controller de marketing
 * Gera sugestões inteligentes de combos foto + legenda + link
 */

/**
 * GET /api/marketing/captions
 * Retorna legendas por estratégia
 */
const getCaptions = async (req, res) => {
  try {
    const { strategy = 'curiosidade', count = 5 } = req.query;

    // Valida estratégia
    if (!isValidMarketingStrategy(strategy)) {
      return res.status(400).json({
        success: false,
        message: 'Estratégia inválida. Válidas: curiosidade, exclusividade, urgencia, oferta, novidade, suave, cta'
      });
    }

    // Pega legendas
    const captions = captionLibrary.getRandomCaptions(strategy, parseInt(count));

    if (captions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Nenhuma legenda encontrada para esta estratégia'
      });
    }

    res.status(200).json({
      success: true,
      strategy: strategy,
      count: captions.length,
      captions: captions
    });
  } catch (error) {
    logger.error('Erro ao buscar legendas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar legendas'
    });
  }
};

/**
 * GET /api/marketing/suggestions
 * Retorna sugestão inteligente baseada em nível de chamada
 */
const getSuggestions = async (req, res) => {
  try {
    const { callLevel = 'medio', count = 3 } = req.query;

    // Valida nível de chamada
    if (!isValidCallLevel(callLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Nível de chamada inválido. Válidas: suave, medio, direto'
      });
    }

    // Estratégias recomendadas por nível
    const strategiesByLevel = {
      suave: ['curiosidade', 'exclusividade'],
      medio: ['curiosidade', 'oferta', 'novidade'],
      direto: ['urgencia', 'oferta', 'cta']
    };

    const strategies = strategiesByLevel[callLevel];
    const suggestions = [];

    // Gera sugestões
    for (let i = 0; i < Math.min(count, strategies.length); i++) {
      const caption = captionLibrary.getSuggestionByCallLevel(callLevel);
      suggestions.push({
        strategy: strategies[i],
        caption: caption
      });
    }

    res.status(200).json({
      success: true,
      callLevel: callLevel,
      recommendations: strategiesByLevel[callLevel],
      suggestions: suggestions,
      tips: {
        suave: 'Use para audiência nova - convida sem pressão',
        medio: 'Balanço entre curiosidade e oferta',
        direto: 'Use para quem já tem interesse - chamada forte'
      }
    });
  } catch (error) {
    logger.error('Erro ao gerar sugestões:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar sugestões'
    });
  }
};

/**
 * POST /api/marketing/generate-combo
 * Gera combo inteligente: foto + legenda + estratégia
 * Salva a legenda no banco e retorna captionId para uso no agendamento
 */
const generateCombo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { photoId, campaignId, callLevel = 'medio', strategy, customLink } = req.body;

    logger.info('🎯 [GENERATE-COMBO] Iniciando geração de combo');
    logger.info(`   photoId: ${photoId}, campaignId: ${campaignId}, callLevel: ${callLevel}, strategy: ${strategy}`);

    // Validações
    if (!photoId || !campaignId) {
      logger.warn('🎯 [GENERATE-COMBO] photoId ou campaignId faltando');
      return res.status(400).json({
        success: false,
        message: 'photoId e campaignId são obrigatórios'
      });
    }

    // Valida foto
    const photo = await Photo.findById(photoId);
    if (!photo || photo.user_id !== userId) {
      logger.warn(`🎯 [GENERATE-COMBO] Foto não encontrada: ${photoId}`);
      return res.status(403).json({
        success: false,
        message: 'Foto não encontrada ou sem permissão'
      });
    }

    // Valida campanha
    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.user_id !== userId) {
      logger.warn(`🎯 [GENERATE-COMBO] Campanha não encontrada: ${campaignId}`);
      return res.status(403).json({
        success: false,
        message: 'Campanha não encontrada ou sem permissão'
      });
    }

    // Valida nível de chamada
    if (!isValidCallLevel(callLevel)) {
      logger.warn(`🎯 [GENERATE-COMBO] callLevel inválido: ${callLevel}`);
      return res.status(400).json({
        success: false,
        message: 'Nível de chamada inválido: suave, medio, direto'
      });
    }

    // Pega estratégia recomendada ou usa fornecida
    let finalStrategy = strategy;
    if (!finalStrategy || !isValidMarketingStrategy(finalStrategy)) {
      // Usa sugestão automática baseada no nível
      const strategiesByLevel = {
        suave: ['curiosidade', 'exclusividade'],
        medio: ['curiosidade', 'oferta'],
        direto: ['urgencia', 'cta']
      };
      const strategies = strategiesByLevel[callLevel];
      finalStrategy = strategies[Math.floor(Math.random() * strategies.length)];
    }

    // Gera caption
    const caption = captionLibrary.getSuggestionByCallLevel(callLevel);
    logger.info(`🎯 [GENERATE-COMBO] Caption gerado (${finalStrategy}): ${caption.substring(0, 50)}...`);

    // Salva caption no banco
    let captionId;
    try {
      captionId = await Caption.create(userId, caption, finalStrategy);
      logger.info(`🎯 [GENERATE-COMBO] Caption salvo no banco: ID ${captionId}`);
    } catch (captionError) {
      logger.error(`🎯 [GENERATE-COMBO] Erro ao salvar caption:`, captionError);
      // Continua mesmo se falhar, mas retorna erro
      return res.status(500).json({
        success: false,
        message: 'Erro ao salvar legenda no banco',
        error: captionError.message
      });
    }

    // Link padrão é da campanha ou personalizado
    let link = customLink;
    if (!link) {
      // Gera link padrão (em produção seria um link real)
      link = `https://seu-dominio.com/oferta?campaign=${campaignId}&photo=${photoId}`;
    }

    // Retorna combo completo COM captionId
    const combo = {
      captionId: captionId,
      photoId: photoId,
      photoUrl: photo.url,
      photoFilePath: photo.file_path,
      campaignId: campaignId,
      campaignName: campaign.name,
      strategy: finalStrategy,
      callLevel: callLevel,
      caption: caption,
      link: link,
      fullMessage: `${caption}\n\n🔗 ${link}`,
      metadata: {
        photoType: photo.type || 'previa',
        callLevel: callLevel,
        strategy: finalStrategy,
        timestamp: new Date().toISOString()
      }
    };

    logger.info(`✅ [GENERATE-COMBO] Combo gerado com sucesso (ID ${captionId})`);

    res.status(200).json({
      success: true,
      message: 'Combo de marketing gerado com sucesso',
      combo: combo,
      nextStep: 'Use este combo para criar um agendamento'
    });
  } catch (error) {
    logger.error('❌ [GENERATE-COMBO] Erro ao gerar combo:', error);
    logger.error(`   Mensagem: ${error.message}`);
    logger.error(`   Stack: ${error.stack}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar combo',
      error: error.message
    });
  }
};

/**
 * GET /api/marketing/info
 * Retorna informações sobre o sistema de marketing
 */
const getInfo = async (req, res) => {
  try {
    const totalCaptions = captionLibrary.getTotalCaptions();
    const categories = captionLibrary.getCategories();

    res.status(200).json({
      success: true,
      marketing: {
        totalCaptions: totalCaptions,
        strategies: categories,
        photoTypes: ['previa', 'destaque', 'oferta', 'novidade'],
        callLevels: ['suave', 'medio', 'direto'],
        description: 'Sistema de marketing profissional com legendas de alta conversão'
      },
      tips: {
        1: 'Use "suave" para audiência nova - cria curiosidade',
        2: 'Use "medio" para follow-up - equilibra interesse e chamada',
        3: 'Use "direto" para quem já conhece - vai direto na conversão',
        4: 'Combine estratégias para máxima efetividade',
        5: 'Evite repetir mesma legenda em sequência'
      }
    });
  } catch (error) {
    logger.error('Erro ao obter info:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter informações'
    });
  }
};

module.exports = {
  getCaptions,
  getSuggestions,
  generateCombo,
  getInfo
};
