const { getQuery, allQuery, runQuery } = require('../config/database');
const logger = require('../utils/logger');

class Metric {
  /**
   * Registra uma métrica de envio
   */
  static async create(scheduleId, status = 'pending', errorMessage = null) {
    try {
      const result = await runQuery(
        'INSERT INTO metrics (schedule_id, status, error_message) VALUES (?, ?, ?)',
        [scheduleId, status, errorMessage]
      );
      logger.info(`Métrica registrada: ID ${result.id}`);
      return result.id;
    } catch (error) {
      logger.error('Erro ao registrar métrica:', error);
      throw error;
    }
  }

  /**
   * Atualiza status de uma métrica
   */
  static async updateStatus(scheduleId, status, errorMessage = null) {
    try {
      await runQuery(
        'UPDATE metrics SET status = ?, error_message = ? WHERE schedule_id = ?',
        [status, errorMessage, scheduleId]
      );
      logger.info(`Métrica atualizada: schedule_id ${scheduleId}`);
    } catch (error) {
      logger.error('Erro ao atualizar métrica:', error);
      throw error;
    }
  }

  /**
   * Busca métricas de um agendamento
   */
  static async findByScheduleId(scheduleId) {
    try {
      return await allQuery(
        'SELECT * FROM metrics WHERE schedule_id = ? ORDER BY created_at DESC',
        [scheduleId]
      );
    } catch (error) {
      logger.error('Erro ao buscar métricas:', error);
      throw error;
    }
  }

  /**
   * Lista histórico de publicações
   */
  static async getHistory(userId, limit = 50, offset = 0) {
    try {
      return await allQuery(
        `SELECT m.*, s.link, c.text as caption_text, p.file_path
         FROM metrics m
         LEFT JOIN schedules s ON m.schedule_id = s.id
         LEFT JOIN captions c ON s.caption_id = c.id
         LEFT JOIN photos p ON s.photo_id = p.id
         LEFT JOIN campaigns ca ON s.campaign_id = ca.id
         WHERE ca.user_id = ?
         ORDER BY m.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
    } catch (error) {
      logger.error('Erro ao buscar histórico:', error);
      throw error;
    }
  }

  /**
   * Estatísticas gerais
   */
  static async getStats(userId) {
    try {
      const stats = await getQuery(
        `SELECT
          COUNT(CASE WHEN m.status = 'sent' THEN 1 END) as total_sent,
          COUNT(CASE WHEN m.status = 'failed' THEN 1 END) as total_failed,
          COUNT(CASE WHEN m.status = 'pending' THEN 1 END) as total_pending,
          COUNT(*) as total_metrics
         FROM metrics m
         LEFT JOIN schedules s ON m.schedule_id = s.id
         LEFT JOIN campaigns ca ON s.campaign_id = ca.id
         WHERE ca.user_id = ?`,
        [userId]
      );
      return stats;
    } catch (error) {
      logger.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  /**
   * Busca métricas com erro
   */
  static async findErrors(userId, limit = 20) {
    try {
      return await allQuery(
        `SELECT m.*, s.link, c.text as caption_text
         FROM metrics m
         LEFT JOIN schedules s ON m.schedule_id = s.id
         LEFT JOIN captions c ON s.caption_id = c.id
         LEFT JOIN campaigns ca ON s.campaign_id = ca.id
         WHERE ca.user_id = ? AND m.status = 'failed'
         ORDER BY m.created_at DESC
         LIMIT ?`,
        [userId, limit]
      );
    } catch (error) {
      logger.error('Erro ao buscar métricas com erro:', error);
      throw error;
    }
  }
}

module.exports = Metric;
