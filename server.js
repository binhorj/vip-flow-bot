/**
 * ENTRY POINT DA APLICAÇÃO
 * Este arquivo inicia o servidor Express
 *
 * Para rodar:
 * npm install
 * node server.js
 */

// 0. Setup automático do .env (cria arquivo se não existir)
const setupEnv = require('./src/utils/setupEnv');
setupEnv.createEnvIfNotExists();

// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

// Valida configuração DEPOIS de carregar .env
const envConfigValid = setupEnv.validateConfiguration();

const app = require('./src/app');
const { initializeDatabase } = require('./src/config/database');
const initAdmin = require('./src/utils/initAdmin');
const testAuth = require('./src/utils/testAuth');
const logger = require('./src/utils/logger');
const schedulerService = require('./src/services/schedulerService');
const testModeService = require('./src/services/testModeService');

// Porta do servidor
const PORT = process.env.PORT || 3000;

/**
 * Inicia o servidor
 */
const startServer = async () => {
  try {
    // 0. Verifica se configuração do .env foi validada
    if (!envConfigValid) {
      console.error('\n');
      console.error('❌ ERRO: Configuração do .env inválida ou incompleta!');
      console.error('❌ Verifique as instruções acima e configure o arquivo .env');
      console.error('❌ Depois, reinicie o servidor (node server.js)\n');
      process.exit(1);
    }

    // 1. Valida TEST MODE e mostra aviso
    if (!testModeService.validateConfig()) {
      logger.warn('⚠️ Erros de configuração encontrados. Verifique o .env');
    }
    testModeService.showStartupWarning();

    // 2. Inicializa banco de dados
    logger.info('🔄 Inicializando banco de dados...');
    await initializeDatabase();

    // 3. Cria admin padrão
    logger.info('🔄 Verificando usuário admin...');
    await initAdmin();

    // 4. Testa autenticação
    await testAuth();

    // 5. Inicia scheduler de agendamentos
    logger.info('🔄 Iniciando scheduler de agendamentos...');
    schedulerService.startScheduler();

    // 6. Inicia servidor HTTP
    const server = app.listen(PORT, () => {
      logger.info(`✅ Servidor iniciado na porta ${PORT}`);
      logger.info(`📝 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
      logger.info(`📱 Telegram: POST http://localhost:${PORT}/api/telegram/test-message`);
      logger.info(`💡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('⚠️ SIGTERM recebido, encerrando servidor...');
      server.close(() => {
        logger.info('✅ Servidor encerrado');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Executa quando o arquivo é chamado diretamente
if (require.main === module) {
  startServer();
}

module.exports = startServer;
