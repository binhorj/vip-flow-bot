const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Faz login e retorna JWT
 * Body: { email, password }
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/me
 * Retorna dados do usuário logado
 * Requer: Authorization: Bearer {token}
 */
router.get('/me', authMiddleware, authController.getMe);

/**
 * POST /api/auth/reset-admin
 * SOMENTE EM TEST_MODE
 * Reseta admin@vipflow.com com senha admin123
 * Verifica se funciona: findByEmail, validatePassword, JWT
 */
router.post('/reset-admin', async (req, res) => {
  try {
    // Apenas em TEST_MODE
    if (process.env.TEST_MODE !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'Rota não disponível'
      });
    }

    const bcrypt = require('bcryptjs');
    const logger = require('../utils/logger');
    const { runQuery, getQuery } = require('../config/database');
    const User = require('../models/User');
    const jwtConfig = require('../config/jwt');

    const email = 'admin@vipflow.com';
    const password = 'admin123';

    logger.info('🔑 [RESET-ADMIN] ========== INICIANDO RESET DO ADMIN ==========');
    logger.info(`🔑 [RESET-ADMIN] Email: ${email}`);
    logger.info(`🔑 [RESET-ADMIN] Senha: ${password}`);

    // 1. Verificar se já existe
    logger.info('🔑 [RESET-ADMIN] 1. Verificando se usuário existe...');
    const existingUser = await getQuery('SELECT id, password_hash FROM users WHERE email = ?', [email]);

    // 2. Gerar hash bcrypt
    logger.info('🔑 [RESET-ADMIN] 2. Gerando hash com bcrypt...');
    const passwordHash = await bcrypt.hash(password, 10);
    logger.info(`🔑 [RESET-ADMIN] Hash gerado: ${passwordHash.substring(0, 20)}...`);

    // 3. Criar ou atualizar
    let userId;
    if (existingUser) {
      logger.info(`🔑 [RESET-ADMIN] 3. Usuário encontrado (ID: ${existingUser.id}), atualizando...`);
      await runQuery('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, email]);
      userId = existingUser.id;
      logger.info(`✅ [RESET-ADMIN] Senha atualizada`);
    } else {
      logger.info(`🔑 [RESET-ADMIN] 3. Usuário NÃO encontrado, criando novo...`);
      const result = await runQuery(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        [email, passwordHash]
      );
      userId = result.id;
      logger.info(`✅ [RESET-ADMIN] Usuário criado (ID: ${userId})`);
    }

    // 4. Testar findByEmail
    logger.info('🔑 [RESET-ADMIN] 4. Testando findByEmail()...');
    const testUser = await User.findByEmail(email);
    if (!testUser) {
      logger.error('❌ [RESET-ADMIN] ERRO: findByEmail() retornou null');
      return res.status(500).json({
        success: false,
        message: 'Erro: findByEmail falhou'
      });
    }
    logger.info(`✅ [RESET-ADMIN] findByEmail() funcionou, ID: ${testUser.id}`);

    // 5. Testar validatePassword
    logger.info('🔑 [RESET-ADMIN] 5. Testando validatePassword()...');
    const isValidPass = await User.validatePassword(password, testUser.password_hash);
    logger.info(`🔑 [RESET-ADMIN] Resultado bcrypt.compare(): ${isValidPass}`);

    if (!isValidPass) {
      logger.error('❌ [RESET-ADMIN] ERRO: validatePassword() retornou false!');
      logger.error(`❌ [RESET-ADMIN] Senha testada: ${password}`);
      logger.error(`❌ [RESET-ADMIN] Hash armazenado: ${testUser.password_hash.substring(0, 20)}...`);
      return res.status(500).json({
        success: false,
        message: 'Erro: validatePassword falhou'
      });
    }
    logger.info(`✅ [RESET-ADMIN] validatePassword() funcionou`);

    // 6. Testar geração de JWT
    logger.info('🔑 [RESET-ADMIN] 6. Testando geração de JWT...');
    const testToken = jwtConfig.generateToken({
      userId: testUser.id,
      email: testUser.email
    });
    logger.info(`✅ [RESET-ADMIN] JWT gerado: ${testToken.substring(0, 20)}...`);

    logger.info('✅ [RESET-ADMIN] ========== TODOS OS TESTES PASSARAM ==========');

    res.json({
      success: true,
      message: 'Admin resetado e testado com sucesso',
      email: email,
      password: password,
      tests: {
        findByEmail: true,
        validatePassword: isValidPass,
        jwtGenerated: true
      }
    });

  } catch (error) {
    const logger = require('../utils/logger');
    logger.error('❌ [RESET-ADMIN] ERRO CRÍTICO:', error.message);
    logger.error('❌ [RESET-ADMIN] Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: `Erro ao resetar admin: ${error.message}`
    });
  }
});

module.exports = router;
