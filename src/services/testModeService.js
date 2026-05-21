/**
 * TEST MODE SERVICE
 * Protege o sistema contra envios acidentais em produção
 */

const logger = require('../utils/logger');

const testModeService = {
  /**
   * Verifica se está em modo teste
   */
  isTestMode() {
    const testMode = process.env.TEST_MODE === 'true';
    return testMode;
  },

  /**
   * Obtém o chat ID correto baseado no modo
   */
  getChatId() {
    const isTest = this.isTestMode();
    const chatId = isTest
      ? process.env.TELEGRAM_TEST_CHAT_ID
      : process.env.TELEGRAM_PRODUCTION_CHAT_ID;

    return chatId;
  },

  /**
   * Valida chat ID antes de enviar
   */
  validateChatId() {
    const chatId = this.getChatId();

    if (!chatId) {
      const mode = this.isTestMode() ? 'TESTE' : 'PRODUÇÃO';
      logger.error(`❌ Chat ID de ${mode} não configurado!`);
      throw new Error(`TELEGRAM_${mode === 'TESTE' ? 'TEST' : 'PRODUCTION'}_CHAT_ID não definido`);
    }

    return chatId;
  },

  /**
   * Processa legenda para adicionar prefixo de teste
   */
  processCaption(caption) {
    if (this.isTestMode()) {
      return `[TESTE] ${caption}`;
    }
    return caption;
  },

  /**
   * Log detalhado de envios
   */
  logSend(chatId, caption) {
    const mode = this.isTestMode() ? '🧪 TESTE' : '🚀 PRODUÇÃO';
    const truncated = caption.substring(0, 50) + (caption.length > 50 ? '...' : '');

    logger.info(`${mode} | Chat: ${chatId} | Legenda: ${truncated}`);

    // Em teste, adicionar aviso extra
    if (this.isTestMode()) {
      console.warn('⚠️  SISTEMA EM MODO TESTE - Nenhum envio real foi feito em produção');
    }
  },

  /**
   * Obtém status completo do sistema
   */
  getStatus() {
    const isTest = this.isTestMode();
    const testChatId = process.env.TELEGRAM_TEST_CHAT_ID;
    const prodChatId = process.env.TELEGRAM_PRODUCTION_CHAT_ID;

    return {
      testMode: isTest,
      mode: isTest ? 'TEST' : 'PRODUCTION',
      modeLabel: isTest ? '🧪 TESTE' : '🚀 PRODUÇÃO',
      currentChatId: this.getChatId(),
      testChatConfigured: !!testChatId,
      productionChatConfigured: !!prodChatId,
      warning: isTest ? '⚠️  Modo de TESTE ativo. Nenhum envio real será feito.' : '🔴 Modo PRODUÇÃO. Envios reais serão enviados!',
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ? '✅ Configurado' : '❌ Não configurado',
      environment: process.env.NODE_ENV || 'development'
    };
  },

  /**
   * Mostrar aviso ao iniciar
   */
  showStartupWarning() {
    const isTest = this.isTestMode();

    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════╗');

    if (isTest) {
      console.log('║         🧪 SISTEMA EM MODO TESTE                      ║');
      console.log('║  Nenhum envio real será feito em produção             ║');
      console.log('║  Todos os envios irão para TELEGRAM_TEST_CHAT_ID      ║');
      console.log('║                                                       ║');
      console.log('║  ⚠️  Antes de usar em PRODUÇÃO:                       ║');
      console.log('║     1. Testar campanhas completas                    ║');
      console.log('║     2. Validar cooldown anti-spam                    ║');
      console.log('║     3. Validar marketing e métricas                  ║');
      console.log('║     4. Alterar TEST_MODE=false no .env               ║');
      console.log('║     5. Reiniciar o servidor                          ║');
    } else {
      console.log('║         🔴 MODO PRODUÇÃO ATIVO                        ║');
      console.log('║  Envios REAIS serão enviados para Telegram            ║');
      console.log('║  CUIDADO: Verifique tudo antes de iniciar             ║');
      console.log('║                                                       ║');
      console.log('║  Para voltar ao modo TESTE:                          ║');
      console.log('║     1. Alterar TEST_MODE=true no .env                 ║');
      console.log('║     2. Reiniciar o servidor                          ║');
    }

    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('\n');
  },

  /**
   * Validar configurações críticas
   */
  validateConfig() {
    const issues = [];
    const isTest = this.isTestMode();

    if (!process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN === 'seu_token_do_bot_aqui') {
      issues.push('TELEGRAM_BOT_TOKEN não configurado ou ainda tem valor de exemplo');
    }

    if (isTest) {
      if (!process.env.TELEGRAM_TEST_CHAT_ID || process.env.TELEGRAM_TEST_CHAT_ID === 'seu_chat_id_de_teste_aqui') {
        issues.push('TELEGRAM_TEST_CHAT_ID não configurado ou ainda tem valor de exemplo (obrigatório em TEST_MODE)');
      }
    } else {
      if (!process.env.TELEGRAM_PRODUCTION_CHAT_ID || process.env.TELEGRAM_PRODUCTION_CHAT_ID === 'seu_chat_id_de_producao_aqui') {
        issues.push('TELEGRAM_PRODUCTION_CHAT_ID não configurado ou ainda tem valor de exemplo (obrigatório em PRODUÇÃO)');
      }
    }

    if (issues.length > 0) {
      console.error('\n');
      console.error('╔════════════════════════════════════════════════════════════╗');
      console.error('║          ⚠️  AVISO DE CONFIGURAÇÃO                         ║');
      console.error('╚════════════════════════════════════════════════════════════╝');
      console.error('\n');
      console.error('❌ Problemas encontrados:\n');
      issues.forEach((issue, index) => {
        console.error(`   ${index + 1}. ${issue}`);
      });
      console.error('\n');
      console.error('📝 SOLUÇÃO:\n');
      console.error('   1. Abra o arquivo: .env');
      console.error('   2. Configure as variáveis faltando (veja instruções acima)');
      console.error('   3. Salve o arquivo');
      console.error('   4. Reinicie o servidor (Ctrl+C e depois: node server.js)\n');
      console.error('════════════════════════════════════════════════════════════\n');
    }

    return issues.length === 0;
  }
};

module.exports = testModeService;
