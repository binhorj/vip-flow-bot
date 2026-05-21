const logger = require('../utils/logger');

/**
 * Middleware de tratamento de erros centralizado
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Erro na requisição:', err);

  // Erros de validação do express-validator
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: err.array()
    });
  }

  // Erro de banco de dados
  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    return res.status(400).json({
      success: false,
      message: 'Email já cadastrado'
    });
  }

  // Erro genérico
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { error: err.stack })
  });
};

module.exports = errorHandler;
