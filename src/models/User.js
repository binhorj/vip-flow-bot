const bcrypt = require('bcryptjs');
const { getQuery, allQuery, runQuery } = require('../config/database');
const logger = require('../utils/logger');

class User {
  /**
   * Cria um novo usuário
   */
  static async create(email, password) {
    try {
      // Criptografa a senha
      const passwordHash = await bcrypt.hash(password, 10);

      const result = await runQuery(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        [email, passwordHash]
      );

      logger.info(`Novo usuário criado: ${email}`);
      return result.id;
    } catch (error) {
      logger.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por email
   */
  static async findByEmail(email) {
    try {
      return await getQuery('SELECT * FROM users WHERE email = ?', [email]);
    } catch (error) {
      logger.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por ID
   */
  static async findById(id) {
    try {
      return await getQuery('SELECT id, email, created_at, last_login, is_active FROM users WHERE id = ?', [id]);
    } catch (error) {
      logger.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  /**
   * Valida senha do usuário
   */
  static async validatePassword(plainPassword, passwordHash) {
    try {
      return await bcrypt.compare(plainPassword, passwordHash);
    } catch (error) {
      logger.error('Erro ao validar senha:', error);
      throw error;
    }
  }

  /**
   * Atualiza último login
   */
  static async updateLastLogin(userId) {
    try {
      await runQuery('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
    } catch (error) {
      logger.error('Erro ao atualizar último login:', error);
      throw error;
    }
  }

  /**
   * Lista todos os usuários (admin)
   */
  static async getAll() {
    try {
      return await allQuery('SELECT id, email, created_at, last_login, is_active FROM users');
    } catch (error) {
      logger.error('Erro ao listar usuários:', error);
      throw error;
    }
  }

  /**
   * Ativa/desativa usuário
   */
  static async toggleActive(userId, isActive) {
    try {
      await runQuery('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, userId]);
    } catch (error) {
      logger.error('Erro ao atualizar status de usuário:', error);
      throw error;
    }
  }
}

module.exports = User;
