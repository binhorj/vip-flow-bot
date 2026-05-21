const User = require('../models/User');
const jwt = require('../config/jwt');
const logger = require('../utils/logger');
const { isValidEmail, isValidPassword } = require('../utils/validators');

/**
 * Login - Autentica usuário e retorna JWT
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info(`🔐 [LOGIN] Email recebido: ${email}`);

    // Valida dados
    if (!email || !password) {
      logger.warn(`🔐 [LOGIN] Email ou senha vazio`);
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    if (!isValidEmail(email)) {
      logger.warn(`🔐 [LOGIN] Email inválido: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Busca usuário
    logger.info(`🔐 [LOGIN] Procurando usuário: ${email}`);
    const user = await User.findByEmail(email);

    if (!user) {
      logger.warn(`🔐 [LOGIN] Usuário NÃO encontrado: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    logger.info(`🔐 [LOGIN] Usuário encontrado, ID: ${user.id}`);

    // Valida senha
    logger.info(`🔐 [LOGIN] Comparando senhas com bcrypt...`);
    const isValidPass = await User.validatePassword(password, user.password_hash);

    logger.info(`🔐 [LOGIN] Resultado bcrypt compare: ${isValidPass}`);

    if (!isValidPass) {
      logger.warn(`🔐 [LOGIN] Senha incorreta para: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Atualiza último login
    await User.updateLastLogin(user.id);

    // Gera token JWT
    const token = jwt.generateToken({
      userId: user.id,
      email: user.email
    });

    logger.info(`✅ [LOGIN] Sucesso - Token gerado para: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      token: token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    logger.error(`❌ [LOGIN] Erro:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login'
    });
  }
};

/**
 * Pega dados do usuário logado
 */
const getMe = async (req, res) => {
  try {
    // req.user vem do middleware de autenticação
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    logger.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados'
    });
  }
};

module.exports = {
  login,
  getMe
};
