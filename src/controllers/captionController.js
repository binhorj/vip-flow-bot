const Caption = require('../models/Caption');
const logger = require('../utils/logger');
const { isValidCategory } = require('../utils/validators');

/**
 * Lista legendas do usuário
 */
const listCaptions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category } = req.query;

    let captions;

    // Se tem filtro de categoria
    if (category) {
      if (!isValidCategory(category)) {
        return res.status(400).json({
          success: false,
          message: 'Categoria inválida: soft, curiosity, exclusivity, urgency, cta'
        });
      }
      captions = await Caption.findByCategory(userId, category);
    } else {
      captions = await Caption.findByUserId(userId);
    }

    res.status(200).json({
      success: true,
      count: captions.length,
      captions: captions
    });
  } catch (error) {
    logger.error('Erro ao listar legendas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar legendas'
    });
  }
};

/**
 * Cria nova legenda
 */
const createCaption = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { text, category } = req.body;

    // Validações
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Texto é obrigatório'
      });
    }

    if (!category || !isValidCategory(category)) {
      return res.status(400).json({
        success: false,
        message: 'Categoria inválida: soft, curiosity, exclusivity, urgency, cta'
      });
    }

    if (text.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Texto deve ter pelo menos 5 caracteres'
      });
    }

    // Cria legenda
    const captionId = await Caption.create(userId, text, category);

    res.status(201).json({
      success: true,
      message: 'Legenda criada com sucesso',
      caption: {
        id: captionId,
        text: text,
        category: category
      }
    });
  } catch (error) {
    logger.error('Erro ao criar legenda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar legenda'
    });
  }
};

/**
 * Busca legenda por ID
 */
const getCaption = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const caption = await Caption.findById(id);

    if (!caption) {
      return res.status(404).json({
        success: false,
        message: 'Legenda não encontrada'
      });
    }

    // Valida se pertence ao usuário
    if (caption.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para acessar esta legenda'
      });
    }

    res.status(200).json({
      success: true,
      caption: caption
    });
  } catch (error) {
    logger.error('Erro ao buscar legenda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar legenda'
    });
  }
};

/**
 * Atualiza legenda
 */
const updateCaption = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { text, category } = req.body;

    // Valida se pertence ao usuário
    const caption = await Caption.findById(id);
    if (!caption) {
      return res.status(404).json({
        success: false,
        message: 'Legenda não encontrada'
      });
    }

    if (caption.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para editar esta legenda'
      });
    }

    // Validações
    if (!text || !category) {
      return res.status(400).json({
        success: false,
        message: 'Texto e categoria são obrigatórios'
      });
    }

    if (!isValidCategory(category)) {
      return res.status(400).json({
        success: false,
        message: 'Categoria inválida'
      });
    }

    // Atualiza
    await Caption.update(id, text, category);

    res.status(200).json({
      success: true,
      message: 'Legenda atualizada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao atualizar legenda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar legenda'
    });
  }
};

/**
 * Deleta legenda
 */
const deleteCaption = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Valida se pertence ao usuário
    const caption = await Caption.findById(id);
    if (!caption) {
      return res.status(404).json({
        success: false,
        message: 'Legenda não encontrada'
      });
    }

    if (caption.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para deletar esta legenda'
      });
    }

    // Deleta
    await Caption.delete(id);

    res.status(200).json({
      success: true,
      message: 'Legenda deletada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar legenda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar legenda'
    });
  }
};

module.exports = {
  listCaptions,
  createCaption,
  getCaption,
  updateCaption,
  deleteCaption
};
