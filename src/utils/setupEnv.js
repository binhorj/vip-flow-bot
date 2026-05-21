/**
 * SETUP DO .ENV AUTOMÁTICO
 * Cria e valida o arquivo .env para usuários iniciantes
 */

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const ENV_PATH = path.join(__dirname, '../../.env');
const ENV_EXAMPLE_PATH = path.join(__dirname, '../../.env.example');

/**
 * Verifica se arquivo .env existe
 */
const envExists = () => {
  return fs.existsSync(ENV_PATH);
};

/**
 * Lê arquivo .env.example
 */
const readEnvExample = () => {
  try {
    if (!fs.existsSync(ENV_EXAMPLE_PATH)) {
      logger.error('Arquivo .env.example nao encontrado!');
      return null;
    }
    return fs.readFileSync(ENV_EXAMPLE_PATH, 'utf8');
  } catch (error) {
    logger.error('Erro ao ler .env.example:', error.message);
    return null;
  }
};

/**
 * Cria arquivo .env baseado em .env.example
 */
const createEnvFromExample = () => {
  try {
    const exampleContent = readEnvExample();
    if (!exampleContent) {
      return false;
    }

    fs.writeFileSync(ENV_PATH, exampleContent, 'utf8');
    logger.info('Arquivo .env criado com sucesso!');
    return true;
  } catch (error) {
    logger.error('Erro ao criar .env:', error.message);
    return false;
  }
};

/**
 * Valida se variáveis críticas estão configuradas
 */
const validateCriticalVariables = () => {
  const issues = [];
  const warnings = [];

  // Obrigatórias
  if (!process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN === 'seu_token_do_bot_aqui') {
    issues.push('TELEGRAM_BOT_TOKEN');
  }

  // Baseado em TEST_MODE
  const isTestMode = process.env.TEST_MODE === 'true';

  if (isTestMode) {
    if (!process.env.TELEGRAM_TEST_CHAT_ID || process.env.TELEGRAM_TEST_CHAT_ID === 'seu_chat_id_de_teste_aqui') {
      issues.push('TELEGRAM_TEST_CHAT_ID (necessario em TEST_MODE)');
    }
  } else {
    if (!process.env.TELEGRAM_PRODUCTION_CHAT_ID || process.env.TELEGRAM_PRODUCTION_CHAT_ID === 'seu_chat_id_de_producao_aqui') {
      issues.push('TELEGRAM_PRODUCTION_CHAT_ID (necessario em PRODUCAO)');
    }
  }

  // Warnings (nao impedem execucao)
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'sua_chave_secreta_super_segura_aqui_mude_isso') {
    warnings.push('JWT_SECRET esta com valor padrao - mude em producao!');
  }

  return { issues, warnings };
};

/**
 * Mostra instrucoes para configurar variáveis
 */
const showSetupInstructions = () => {
  console.log('\n');
  console.log('Config do VIP FLOW BOT');
  console.log('\nComo obter o TELEGRAM_BOT_TOKEN:\n');
  console.log('   1. Abra o Telegram e procure por @BotFather');
  console.log('   2. Envie: /newbot');
  console.log('   3. BotFather fornecera um token\n');
  console.log('Como obter o TELEGRAM_TEST_CHAT_ID:\n');
  console.log('   1. No Telegram, crie um grupo privado');
  console.log('   2. Adicione seu bot criado ao grupo');
  console.log('   3. Acesse: https://api.telegram.org/bot<SEU_TOKEN>/getUpdates');
  console.log('   4. Procure por "chat":{"id":XXXXXX}\n');
};

/**
 * Mostra erros de configuracao
 */
const showConfigErrors = (issues) => {
  console.log('\n');
  console.log('ERROS DE CONFIGURACAO - ACAO NECESSARIA');
  console.log('\nEstas variaveis estao faltando ou invalidas:\n');
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
  console.log('\n');

  showSetupInstructions();
};

/**
 * Mostra avisos de configuracao
 */
const showConfigWarnings = (warnings) => {
  if (warnings.length === 0) return;

  console.log('\n');
  console.log('AVISOS DE CONFIGURACAO:\n');
  warnings.forEach(warning => {
    console.log(`   ${warning}`);
  });
  console.log('\n');
};

/**
 * Inicializa setup do .env
 * Executa automaticamente no startup
 */
const initializeEnv = () => {
  console.log('\n');
  console.log('Verificando configuracoes...\n');

  // 1. Verifica se .env existe
  if (!envExists()) {
    console.log('Arquivo .env nao encontrado.');
    console.log('Criando .env baseado em .env.example...\n');

    if (!createEnvFromExample()) {
      console.error('\nErro critico: Nao foi possivel criar o arquivo .env');
      console.error('Verifique se voce tem permissao de escrita no diretorio\n');
      return false;
    }

    // Recarrega variaveis de ambiente
    require('dotenv').config();

    showSetupInstructions();
    return false; // Precisa ser configurado antes de continuar
  }

  // 2. Valida variaveis criticas
  const { issues, warnings } = validateCriticalVariables();

  // Mostra avisos
  if (warnings.length > 0) {
    showConfigWarnings(warnings);
  }

  // Mostra erros se houver
  if (issues.length > 0) {
    showConfigErrors(issues);
    return false; // Nao pode continuar sem configurar
  }

  console.log('Configuracoes validadas com sucesso!\n');
  return true;
};

/**
 * Cria .env se nao existir (chamado por server.js)
 */
const createEnvIfNotExists = () => {
  if (!envExists()) {
    console.log('Arquivo .env nao encontrado.');
    console.log('Criando .env baseado em .env.example...\n');

    if (!createEnvFromExample()) {
      console.error('\nErro critico: Nao foi possivel criar o arquivo .env');
      console.error('Verifique se voce tem permissao de escrita no diretorio\n');
      return false;
    }

    // Recarrega variaveis de ambiente apos criar .env
    require('dotenv').config();
    return true;
  }

  return true;
};

/**
 * Valida configuracao (chamado por server.js apos dotenv.config())
 */
const validateConfiguration = () => {
  // Valida variaveis criticas
  const { issues, warnings } = validateCriticalVariables();

  // Mostra avisos
  if (warnings.length > 0) {
    showConfigWarnings(warnings);
  }

  // Mostra erros se houver
  if (issues.length > 0) {
    showConfigErrors(issues);
    return false;
  }

  console.log('Configuracoes validadas com sucesso!\n');
  return true;
};

module.exports = {
  envExists,
  readEnvExample,
  createEnvFromExample,
  validateCriticalVariables,
  showSetupInstructions,
  showConfigErrors,
  showConfigWarnings,
  initializeEnv,
  createEnvIfNotExists,
  validateConfiguration
};
