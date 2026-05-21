const { getQuery, allQuery, runQuery } = require('../config/database');
const logger = require('../utils/logger');

class Schedule {
  /**
   * Cria um novo agendamento
   */
  static async create(campaignId, photoId, captionId, link, scheduledAt) {
    try {
      const result = await runQuery(
        'INSERT INTO schedules (campaign_id, photo_id, caption_id, link, scheduled_at) VALUES (?, ?, ?, ?, ?)',
        [campaignId, photoId, captionId, link, scheduledAt]
      );
      logger.info(`Agendamento criado: ID ${result.id}`);
      return result.id;
    } catch (error) {
      logger.error('Erro ao criar agendamento:', error);
      throw error;
    }
  }

  /**
   * Busca agendamento por ID
   */
  static async findById(id) {
    try {
      return await getQuery(
        `SELECT s.*, p.file_path, p.url as photo_url, c.text as caption_text, ca.name as campaign_name
         FROM schedules s
         LEFT JOIN photos p ON s.photo_id = p.id
         LEFT JOIN captions c ON s.caption_id = c.id
         LEFT JOIN campaigns ca ON s.campaign_id = ca.id
         WHERE s.id = ?`,
        [id]
      );
    } catch (error) {
      logger.error('Erro ao buscar agendamento:', error);
      throw error;
    }
  }

  /**
   * Lista todos os agendamentos não-enviados (sem filtro de data)
   * A comparação de datas é feita em JavaScript
   */
  static async findAllUnsent() {
    try {
      return await allQuery(
        `SELECT s.*, p.file_path, p.url as photo_url, c.text as caption_text, ca.name as campaign_name
         FROM schedules s
         LEFT JOIN photos p ON s.photo_id = p.id
         LEFT JOIN captions c ON s.caption_id = c.id
         LEFT JOIN campaigns ca ON s.campaign_id = ca.id
         WHERE s.is_sent = 0
         ORDER BY s.scheduled_at ASC`,
        []
      );
    } catch (error) {
      logger.error('Erro ao listar agendamentos não-enviados:', error);
      throw error;
    }
  }

  /**
   * Lista agendamentos pendentes (DEPRECATED - use findAllUnsent no scheduler)
   */
  static async findPending() {
    try {
      return await allQuery(
        `SELECT s.*, p.file_path, p.url as photo_url, c.text as caption_text, ca.name as campaign_name
         FROM schedules s
         LEFT JOIN photos p ON s.photo_id = p.id
         LEFT JOIN captions c ON s.caption_id = c.id
         LEFT JOIN campaigns ca ON s.campaign_id = ca.id
         WHERE s.is_sent = 0 AND s.scheduled_at <= CURRENT_TIMESTAMP
         ORDER BY s.scheduled_at ASC`,
        []
      );
    } catch (error) {
      logger.error('Erro ao listar agendamentos pendentes:', error);
      throw error;
    }
  }

  /**
   * Lista agendamentos de uma campanha
   */
  static async findByCampaignId(campaignId) {
    try {
      return await allQuery(
        `SELECT s.*, p.file_path, p.url as photo_url, c.text as caption_text
         FROM schedules s
         LEFT JOIN photos p ON s.photo_id = p.id
         LEFT JOIN captions c ON s.caption_id = c.id
         WHERE s.campaign_id = ?
         ORDER BY s.scheduled_at DESC`,
        [campaignId]
      );
    } catch (error) {
      logger.error('Erro ao listar agendamentos da campanha:', error);
      throw error;
    }
  }

  /**
   * Marca agendamento como enviado
   */
  static async markAsSent(id) {
    try {
      await runQuery(
        'UPDATE schedules SET is_sent = 1, sent_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      logger.info(`Agendamento marcado como enviado: ID ${id}`);
    } catch (error) {
      logger.error('Erro ao marcar como enviado:', error);
      throw error;
    }
  }

  /**
   * Atualiza agendamento
   */
  static async update(id, scheduledAt, link) {
    try {
      await runQuery(
        'UPDATE schedules SET scheduled_at = ?, link = ? WHERE id = ?',
        [scheduledAt, link, id]
      );
      logger.info(`Agendamento atualizado: ID ${id}`);
    } catch (error) {
      logger.error('Erro ao atualizar agendamento:', error);
      throw error;
    }
  }

  /**
   * Deleta agendamento
   */
  static async delete(id) {
    try {
      await runQuery('DELETE FROM schedules WHERE id = ?', [id]);
      logger.info(`Agendamento deletado: ID ${id}`);
    } catch (error) {
      logger.error('Erro ao deletar agendamento:', error);
      throw error;
    }
  }

  /**
   * Conta agendamentos de uma campanha
   */
  static async countByCampaignId(campaignId) {
    try {
      const result = await getQuery(
        'SELECT COUNT(*) as count FROM schedules WHERE campaign_id = ?',
        [campaignId]
      );
      return result.count;
    } catch (error) {
      logger.error('Erro ao contar agendamentos:', error);
      throw error;
    }
  }
}

module.exports = Schedule;
