const Photo = require('../models/Photo');
const logger = require('../utils/logger');

/**
 * Lista fotos do usuário
 */
const listPhotos = async (req, res) => {
  try {
    const userId = req.user.userId;

    const photos = await Photo.findByUserId(userId);

    res.status(200).json({
      success: true,
      count: photos.length,
      photos: photos
    });
  } catch (error) {
    logger.error('Erro ao listar fotos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar fotos'
    });
  }
};

/**
 * Cria foto (simulação - em produção faria upload de arquivo)
 * Para este exemplo, aceita um URL da foto
 */
const createPhoto = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { filePath, url } = req.body;

    // Validações
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'filePath é obrigatório'
      });
    }

    // Cria foto no banco
    const photoId = await Photo.create(userId, filePath, url);

    res.status(201).json({
      success: true,
      message: 'Foto criada com sucesso',
      photo: {
        id: photoId,
        filePath: filePath,
        url: url
      }
    });
  } catch (error) {
    logger.error('Erro ao criar foto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar foto'
    });
  }
};

/**
 * Busca foto por ID
 */
const getPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const photo = await Photo.findById(id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Foto não encontrada'
      });
    }

    // Valida se a foto pertence ao usuário
    if (photo.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para acessar esta foto'
      });
    }

    res.status(200).json({
      success: true,
      photo: photo
    });
  } catch (error) {
    logger.error('Erro ao buscar foto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar foto'
    });
  }
};

/**
 * Deleta foto
 */
const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Valida se a foto pertence ao usuário
    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Foto não encontrada'
      });
    }

    if (photo.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para deletar esta foto'
      });
    }

    // Deleta foto
    await Photo.delete(id);

    res.status(200).json({
      success: true,
      message: 'Foto deletada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar foto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar foto'
    });
  }
};

module.exports = {
  listPhotos,
  createPhoto,
  getPhoto,
  deletePhoto
};
