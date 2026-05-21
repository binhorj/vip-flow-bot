const jwt = require('../config/jwt');
const logger = require('../utils/logger');

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido
 */
const authMiddleware = (req, res, next) => {
  try {
    // Pega o token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn('Tentativa de acesso sem token');
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido. Use: Authorization: Bearer {token}'
      });
    }

    // Remove "Bearer " do token
    const token = authHeader.replace('Bearer ', '');

    // Verifica o token
    const decoded = jwt.verifyToken(token);

    // Adiciona dados do usuário ao request
    req.user = decoded;
    logger.debug(`Usuário autenticado: ${decoded.userId}`);

    next();
  } catch (error) {
    logger.error('Erro de autenticação:', error);

    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Faça login novamente.'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

module.exports = authMiddleware;
