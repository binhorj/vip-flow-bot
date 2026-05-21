/**
 * Testa se a autenticação está funcionando corretamente
 * Executa automaticamente após initAdmin no startup
 */

const User = require('../models/User');
const jwt = require('../config/jwt');
const logger = require('./logger');

const testAuth = async () => {
  try {
    logger.info('');
    logger.info('🔐 ========== TESTANDO AUTENTICAÇÃO ==========');

    const email = 'admin@vipflow.com';
    const password = 'admin123';

    // Teste 1: findByEmail
    logger.info(`🔐 [TEST] 1. Buscando usuário: ${email}`);
    const user = await User.findByEmail(email);

    if (!user) {
      logger.error('❌ [TEST] Usuário NÃO encontrado!');
      return false;
    }

    logger.info(`🔐 [TEST] ✅ Usuário encontrado (ID: ${user.id})`);

    // Teste 2: validatePassword
    logger.info(`🔐 [TEST] 2. Validando senha...`);
    const isValid = await User.validatePassword(password, user.password_hash);

    logger.info(`🔐 [TEST] Resultado bcrypt.compare(): ${isValid}`);

    if (!isValid) {
      logger.error('❌ [TEST] Senha INVÁLIDA!');
      logger.error(`❌ [TEST] Esperado: ${password}`);
      logger.error(`❌ [TEST] Hash armazenado: ${user.password_hash.substring(0, 30)}...`);
      return false;
    }

    logger.info(`🔐 [TEST] ✅ Senha válida`);

    // Teste 3: JWT
    logger.info(`🔐 [TEST] 3. Gerando JWT...`);
    const token = jwt.generateToken({
      userId: user.id,
      email: user.email
    });

    logger.info(`🔐 [TEST] ✅ JWT gerado com sucesso`);

    logger.info('');
    logger.info('✅ ========== AUTENTICAÇÃO OK ==========');
    logger.info(`✅ Login pronto: ${email} / ${password}`);
    logger.info('');

    return true;

  } catch (error) {
    logger.error('');
    logger.error('❌ ========== ERRO NA AUTENTICAÇÃO ==========');
    logger.error(`❌ Erro: ${error.message}`);
    logger.error(`❌ Stack: ${error.stack}`);
    logger.error('');
    return false;
  }
};

module.exports = testAuth;
