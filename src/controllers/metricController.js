const Metric = require('../models/Metric');
const logger = require('../utils/logger');

/**
 * Retorna histórico de publicações
 */
const getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const history = await Metric.getHistory(userId, parseInt(limit), parseInt(offset));

    res.status(200).json({
      success: true,
      count: history.length,
      history: history
    });
  } catch (error) {
    logger.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico'
    });
  }
};

/**
 * Retorna estatísticas gerais
 */
const getStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await Metric.getStats(userId);

    // Calcula taxa de sucesso
    const successRate = stats.total_metrics > 0
      ? ((stats.total_sent / stats.total_metrics) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalSent: stats.total_sent || 0,
        totalFailed: stats.total_failed || 0,
        totalPending: stats.total_pending || 0,
        totalMetrics: stats.total_metrics || 0,
        successRate: `${successRate}%`
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
};

/**
 * Busca erros recentes
 */
const getErrors = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20 } = req.query;

    const errors = await Metric.findErrors(userId, parseInt(limit));

    res.status(200).json({
      success: true,
      count: errors.length,
      errors: errors
    });
  } catch (error) {
    logger.error('Erro ao buscar erros:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar erros'
    });
  }
};

module.exports = {
  getHistory,
  getStats,
  getErrors
};
