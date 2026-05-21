const { getQuery, allQuery, runQuery } = require('../config/database');
const logger = require('../utils/logger');

class Campaign {
  /**
   * Cria uma nova campanha
   */
  static async create(userId, name, startDate = null, endDate = null) {
    try {
      const result = await runQuery(
        'INSERT INTO campaigns (user_id, name, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
        [userId, name, startDate, endDate, 'active']
      );
      logger.info(`Campanha criada: ID ${result.id}`);
      return result.id;
    } catch (error) {
      logger.error('Erro ao criar campanha:', error);
      throw error;
    }
  }

  /**
   * Busca campanha por ID
   */
  static async findById(id) {
    try {
      return await getQuery('SELECT * FROM campaigns WHERE id = ?', [id]);
    } catch (error) {
      logger.error('Erro ao buscar campanha:', error);
      throw error;
    }
  }

  /**
   * Lista campanhas de um usuário
   */
  static async findByUserId(userId) {
    try {
      return await allQuery(
        'SELECT * FROM campaigns WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
    } catch (error) {
      logger.error('Erro ao listar campanhas:', error);
      throw error;
    }
  }

  /**
   * Lista campanhas ativas
   */
  static async findActive(userId) {
    try {
      return await allQuery(
        'SELECT * FROM campaigns WHERE user_id = ? AND status = ? ORDER BY created_at DESC',
        [userId, 'active']
      );
    } catch (error) {
      logger.error('Erro ao listar campanhas ativas:', error);
      throw error;
    }
  }

  /**
   * Atualiza campanha
   */
  static async update(id, name, startDate, endDate) {
    try {
      await runQuery(
        'UPDATE campaigns SET name = ?, start_date = ?, end_date = ? WHERE id = ?',
        [name, startDate, endDate, id]
      );
      logger.info(`Campanha atualizada: ID ${id}`);
    } catch (error) {
      logger.error('Erro ao atualizar campanha:', error);
      throw error;
    }
  }

  /**
   * Muda status da campanha
   */
  static async updateStatus(id, status) {
    try {
      const validStatuses = ['active', 'paused', 'completed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Status inválido');
      }
      await runQuery('UPDATE campaigns SET status = ? WHERE id = ?', [status, id]);
      logger.info(`Status da campanha atualizado: ID ${id} -> ${status}`);
    } catch (error) {
      logger.error('Erro ao atualizar status da campanha:', error);
      throw error;
    }
  }

  /**
   * Deleta campanha
   */
  static async delete(id) {
    try {
      await runQuery('DELETE FROM campaigns WHERE id = ?', [id]);
      logger.info(`Campanha deletada: ID ${id}`);
    } catch (error) {
      logger.error('Erro ao deletar campanha:', error);
      throw error;
    }
  }

  /**
   * Conta campanhas de um usuário
   */
  static async countByUserId(userId) {
    try {
      const result = await getQuery(
        'SELECT COUNT(*) as count FROM campaigns WHERE user_id = ?',
        [userId]
      );
      return result.count;
    } catch (error) {
      logger.error('Erro ao contar campanhas:', error);
      throw error;
    }
  }
}

module.exports = Campaign;
