const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_this';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

/**
 * Gera um token JWT
 * @param {Object} payload - Dados a serem inclusos no token
 * @returns {String} Token JWT
 */
const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    logger.info(`Token gerado para usuário ID: ${payload.userId}`);
    return token;
  } catch (error) {
    logger.error('Erro ao gerar token:', error.message);
    throw error;
  }
};

/**
 * Verifica e decodifica um token JWT
 * @param {String} token - Token a ser verificado
 * @returns {Object} Dados decodificados do token
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    logger.error('Erro ao verificar token:', error.message);
    throw error;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET,
  JWT_EXPIRY
};
