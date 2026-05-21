const User = require('../models/User');
const logger = require('./logger');

/**
 * Cria o usuário admin padrão se não existir
 * IMPORTANTE: Execute apenas UMA VEZ na inicialização
 */
const initAdmin = async () => {
  try {
    // Email do admin padrão
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vipflow.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const testMode = process.env.TEST_MODE === 'true';

    // Verifica se admin já existe
    const existingAdmin = await User.findByEmail(adminEmail);

    if (existingAdmin) {
      // Em TEST_MODE, resetar senha para admin123 automaticamente
      if (testMode) {
        logger.info(`🔄 TEST_MODE ativo - resetando senha do admin para: admin123`);
        const bcrypt = require('bcryptjs');
        const passwordHash = await bcrypt.hash('admin123', 10);
        const { runQuery } = require('../config/database');
        await runQuery('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, adminEmail]);
        logger.info(`✅ Senha do admin resetada com sucesso!`);
      } else {
        logger.info(`✅ Admin já existe: ${adminEmail}`);
      }
      return;
    }

    // Cria novo admin
    const adminId = await User.create(adminEmail, adminPassword);
    logger.info(`✅ Admin criado com sucesso!`);
    logger.info(`   Email: ${adminEmail}`);
    logger.info(`   Senha: ${adminPassword}`);
    logger.info(`   ID: ${adminId}`);
    logger.info(`   ⚠️ MUDE A SENHA EM PRODUÇÃO!`);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      logger.info('✅ Admin já existe');
    } else {
      logger.error('Erro ao inicializar admin:', error);
    }
  }
};

module.exports = initAdmin;
