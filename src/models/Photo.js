const { getQuery, allQuery, runQuery } = require('../config/database');
const logger = require('../utils/logger');

class Photo {
  /**
   * Cria uma nova foto
   */
  static async create(userId, filePath, url = null, type = 'previa') {
    try {
      const result = await runQuery(
        'INSERT INTO photos (user_id, file_path, url, type) VALUES (?, ?, ?, ?)',
        [userId, filePath, url, type]
      );
      logger.info(`Foto criada: ID ${result.id}`);
      return result;
    } catch (error) {
      logger.error('Erro ao criar foto:', error);
      throw error;
    }
  }

  /**
   * Busca foto por ID
   */
  static async findById(id) {
    try {
      return await getQuery('SELECT * FROM photos WHERE id = ?', [id]);
    } catch (error) {
      logger.error('Erro ao buscar foto:', error);
      throw error;
    }
  }

  /**
   * Lista fotos de um usuário
   */
  static async findByUserId(userId) {
    try {
      return await allQuery(
        'SELECT * FROM photos WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
    } catch (error) {
      logger.error('Erro ao listar fotos do usuário:', error);
      throw error;
    }
  }

  /**
   * Atualiza URL da foto
   */
  static async updateUrl(id, url) {
    try {
      await runQuery('UPDATE photos SET url = ? WHERE id = ?', [url, id]);
    } catch (error) {
      logger.error('Erro ao atualizar URL da foto:', error);
      throw error;
    }
  }

  /**
   * Deleta uma foto
   */
  static async delete(id) {
    try {
      await runQuery('DELETE FROM photos WHERE id = ?', [id]);
      logger.info(`Foto deletada: ID ${id}`);
    } catch (error) {
      logger.error('Erro ao deletar foto:', error);
      throw error;
    }
  }

  /**
   * Conta fotos de um usuário
   */
  static async countByUserId(userId) {
    try {
      const result = await getQuery(
        'SELECT COUNT(*) as count FROM photos WHERE user_id = ?',
        [userId]
      );
      return result.count;
    } catch (error) {
      logger.error('Erro ao contar fotos:', error);
      throw error;
    }
  }

  /**
   * Registra uso de uma foto (incrementa contador)
   */
  static async updateUsage(id) {
    try {
      const now = new Date().toISOString();
      await runQuery(
        'UPDATE photos SET usage_count = usage_count + 1, last_used_at = ? WHERE id = ?',
        [now, id]
      );
      logger.info(`📊 Foto ${id} - uso registrado`);
    } catch (error) {
      logger.error('Erro ao atualizar uso da foto:', error);
      throw error;
    }
  }

  /**
   * Busca foto menos usada de uma categoria (variedade inteligente)
   * Evita usar photos recentes
   */
  static async findLeastUsedByCategory(userId, category = 'preview', lastPhotosIds = []) {
    try {
      let query = `
        SELECT * FROM photos
        WHERE user_id = ? AND category = ?
      `;
      const params = [userId, category];

      // Se há fotos recentes usadas, exclui da seleção
      if (lastPhotosIds.length > 0) {
        const placeholders = lastPhotosIds.map(() => '?').join(',');
        query += ` AND id NOT IN (${placeholders})`;
        params.push(...lastPhotosIds);
      }

      // Ordena por uso (menos usada primeiro), depois por data
      query += ` ORDER BY usage_count ASC, last_used_at ASC LIMIT 1`;

      const photo = await getQuery(query, params);
      return photo;
    } catch (error) {
      logger.error('Erro ao buscar foto menos usada:', error);
      throw error;
    }
  }

  /**
   * Busca últimas fotos usadas (para evitar repetição)
   */
  static async getLastUsedPhotos(userId, limit = 10) {
    try {
      return await allQuery(
        `SELECT id, category, usage_count, last_used_at FROM photos
         WHERE user_id = ? AND last_used_at IS NOT NULL
         ORDER BY last_used_at DESC LIMIT ?`,
        [userId, limit]
      );
    } catch (error) {
      logger.error('Erro ao buscar últimas fotos usadas:', error);
      throw error;
    }
  }

  /**
   * Atualiza categoria de uma foto
   */
  static async updateCategory(id, category) {
    try {
      const validCategories = ['preview', 'destaque', 'lifestyle', 'vip'];
      if (!validCategories.includes(category)) {
        category = 'preview';
      }
      await runQuery('UPDATE photos SET category = ? WHERE id = ?', [category, id]);
      logger.info(`Categoria atualizada: Foto ${id} -> ${category}`);
    } catch (error) {
      logger.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de uma foto
   */
  static async getStats(id) {
    try {
      const photo = await getQuery(
        'SELECT id, category, usage_count, last_used_at FROM photos WHERE id = ?',
        [id]
      );
      return {
        id: photo?.id,
        category: photo?.category || 'preview',
        usageCount: photo?.usage_count || 0,
        lastUsedAt: photo?.last_used_at
      };
    } catch (error) {
      logger.error('Erro ao obter stats da foto:', error);
      throw error;
    }
  }
}

module.exports = Photo;
