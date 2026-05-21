const { getQuery, allQuery, runQuery } = require('../config/database');
const logger = require('../utils/logger');

class Caption {
  /**
   * Cria uma nova legenda
   */
  static async create(userId, text, category = 'soft') {
    try {
      const result = await runQuery(
        'INSERT INTO captions (user_id, text, category) VALUES (?, ?, ?)',
        [userId, text, category]
      );
      logger.info(`Legenda criada: ID ${result.id}`);
      return result.id;
    } catch (error) {
      logger.error('Erro ao criar legenda:', error);
      throw error;
    }
  }

  /**
   * Busca legenda por ID
   */
  static async findById(id) {
    try {
      return await getQuery('SELECT * FROM captions WHERE id = ?', [id]);
    } catch (error) {
      logger.error('Erro ao buscar legenda:', error);
      throw error;
    }
  }

  /**
   * Lista legendas de um usuário
   */
  static async findByUserId(userId) {
    try {
      return await allQuery(
        'SELECT * FROM captions WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
    } catch (error) {
      logger.error('Erro ao listar legendas:', error);
      throw error;
    }
  }

  /**
   * Lista legendas por categoria
   */
  static async findByCategory(userId, category) {
    try {
      return await allQuery(
        'SELECT * FROM captions WHERE user_id = ? AND category = ? ORDER BY RANDOM() LIMIT 5',
        [userId, category]
      );
    } catch (error) {
      logger.error('Erro ao buscar legendas por categoria:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma legenda
   */
  static async update(id, text, category) {
    try {
      await runQuery(
        'UPDATE captions SET text = ?, category = ? WHERE id = ?',
        [text, category, id]
      );
      logger.info(`Legenda atualizada: ID ${id}`);
    } catch (error) {
      logger.error('Erro ao atualizar legenda:', error);
      throw error;
    }
  }

  /**
   * Deleta uma legenda
   */
  static async delete(id) {
    try {
      await runQuery('DELETE FROM captions WHERE id = ?', [id]);
      logger.info(`Legenda deletada: ID ${id}`);
    } catch (error) {
      logger.error('Erro ao deletar legenda:', error);
      throw error;
    }
  }

  /**
   * Conta legendas de um usuário
   */
  static async countByUserId(userId) {
    try {
      const result = await getQuery(
        'SELECT COUNT(*) as count FROM captions WHERE user_id = ?',
        [userId]
      );
      return result.count;
    } catch (error) {
      logger.error('Erro ao contar legendas:', error);
      throw error;
    }
  }
}

module.exports = Caption;
