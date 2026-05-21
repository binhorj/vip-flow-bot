const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const logger = require('../utils/logger');
const Metric = require('../models/Metric');
const testModeService = require('./testModeService');

/**
 * Serviço de integração com Telegram
 * Envia mensagens, fotos e controla anti-spam
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = 'https://api.telegram.org/bot';

// Controla último envio para anti-spam
const lastSendTime = {};
const MIN_INTERVAL_MS = 30000; // 30 segundos mínimo entre mensagens

/**
 * Valida se token e chat_id estão configurados
 */
const validateConfig = () => {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN não configurado no .env');
  }
  return true;
};

/**
 * Obtém informações do bot (valida token)
 */
const getMe = async () => {
  try {
    validateConfig();
    const response = await axios.get(`${TELEGRAM_API}${TELEGRAM_BOT_TOKEN}/getMe`);
    return response.data;
  } catch (error) {
    logger.error('Erro ao validar token do Telegram:', error.message);
    throw new Error('Token do Telegram inválido ou bot não encontrado');
  }
};

/**
 * Envia mensagem de texto simples
 * Útil para testes
 */
const sendMessage = async (chatId, text) => {
  try {
    validateConfig();

    if (!chatId) {
      throw new Error('Chat ID é obrigatório');
    }

    logger.debug(`Enviando mensagem para chat ${chatId}`);

    const response = await axios.post(
      `${TELEGRAM_API}${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      },
      { timeout: 10000 }
    );

    logger.info(`✅ Mensagem enviada: chat ${chatId}`);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.description || error.message;
    logger.error(`❌ Erro ao enviar mensagem: ${errorMsg}`);
    throw new Error(errorMsg);
  }
};

/**
 * Detecta se uma URL é local (localhost ou /uploads)
 */
const isLocalUrl = (url) => {
  return url.includes('localhost') ||
         url.includes('127.0.0.1') ||
         url.startsWith('/uploads') ||
         !url.startsWith('http');
};

/**
 * Resolve caminho local da URL ou caminho relativo
 */
const resolveLocalPath = (url) => {
  let filePath;

  if (url.startsWith('/uploads')) {
    // Caminho relativo /uploads/...
    filePath = path.join(__dirname, '../../public', url);
  } else if (url.includes('localhost') || url.includes('127.0.0.1')) {
    // URL completa com localhost
    try {
      const urlPath = new URL(url).pathname;
      filePath = path.join(__dirname, '../../public', urlPath);
    } catch (e) {
      throw new Error(`URL inválida: ${url}`);
    }
  } else {
    // Caminho direto
    filePath = url;
  }

  return filePath;
};

/**
 * Envia foto com legenda e link
 * Este é o método principal para postagens
 * Suporta URLs locais (arquivo) e URLs públicas
 */
const sendPhoto = async (chatId, photoUrl, caption, link) => {
  try {
    validateConfig();

    if (!chatId || !photoUrl || !caption) {
      throw new Error('chatId, photoUrl e caption são obrigatórios');
    }

    // Formata a mensagem com link
    const fullCaption = `${caption}\n\n🔗 ${link}`;

    // Trunca se muito longo (2000 caracteres máximo no Telegram)
    const finalCaption = fullCaption.length > 2000
      ? fullCaption.substring(0, 1997) + '...'
      : fullCaption;

    logger.debug(`Enviando foto para chat ${chatId}`);

    // Detecta tipo de URL
    const local = isLocalUrl(photoUrl);
    logger.info(`📸 Tipo de imagem: ${local ? 'LOCAL (arquivo)' : 'URL PÚBLICA'} | URL: ${photoUrl}`);

    if (local) {
      // ===== IMAGEM LOCAL =====
      const filePath = resolveLocalPath(photoUrl);
      logger.info(`📂 Caminho local resolvido: ${filePath}`);

      // Verifica se arquivo existe
      if (!fs.existsSync(filePath)) {
        logger.error(`❌ Arquivo não encontrado: ${filePath}`);
        throw new Error(`Arquivo de imagem não encontrado: ${filePath}`);
      }

      logger.info(`✅ Arquivo existe e será enviado`);

      // Envia usando FormData com arquivo local
      const form = new FormData();
      form.append('chat_id', chatId);
      form.append('photo', fs.createReadStream(filePath));
      form.append('caption', finalCaption);
      form.append('parse_mode', 'HTML');

      const response = await axios.post(
        `${TELEGRAM_API}${TELEGRAM_BOT_TOKEN}/sendPhoto`,
        form,
        {
          headers: form.getHeaders(),
          timeout: 10000
        }
      );

      logger.info(`✅ Foto enviada (arquivo local): chat ${chatId}`);
      return response.data;
    } else {
      // ===== URL PÚBLICA =====
      logger.info(`🌐 Enviando por URL pública`);

      const response = await axios.post(
        `${TELEGRAM_API}${TELEGRAM_BOT_TOKEN}/sendPhoto`,
        {
          chat_id: chatId,
          photo: photoUrl,
          caption: finalCaption,
          parse_mode: 'HTML'
        },
        { timeout: 10000 }
      );

      logger.info(`✅ Foto enviada (URL pública): chat ${chatId}`);
      return response.data;
    }
  } catch (error) {
    const errorMsg = error.response?.data?.description || error.message;
    logger.error(`❌ Erro ao enviar foto: ${errorMsg}`);
    throw new Error(errorMsg);
  }
};

/**
 * Verifica anti-spam (cooldown entre mensagens)
 * Retorna tempo de espera em ms, ou 0 se pode enviar
 */
const getWaitTime = (chatId) => {
  const now = Date.now();
  const last = lastSendTime[chatId] || 0;
  const elapsed = now - last;

  if (elapsed < MIN_INTERVAL_MS) {
    return MIN_INTERVAL_MS - elapsed;
  }

  return 0;
};

/**
 * Registra último envio para anti-spam
 */
const registerSend = (chatId) => {
  lastSendTime[chatId] = Date.now();
};

/**
 * Envia agendamento com proteção anti-spam e TEST MODE
 */
const sendScheduledPost = async (scheduleData) => {
  try {
    const { id, chat_id, photo_url, caption_text, link } = scheduleData;

    // Valida dados
    if (!id || !chat_id || !photo_url || !caption_text || !link) {
      throw new Error('Dados incompletos para envio');
    }

    // Obtém chat ID correto (TEST ou PRODUCTION)
    const actualChatId = testModeService.getChatId();
    const isTest = testModeService.isTestMode();

    // Log detalhado
    testModeService.logSend(actualChatId, caption_text);

    // Processa legenda (adiciona [TESTE] se necessário)
    const processedCaption = testModeService.processCaption(caption_text);

    // Verifica anti-spam
    const waitTime = getWaitTime(actualChatId);
    if (waitTime > 0) {
      logger.warn(`⏳ Anti-spam: aguardando ${Math.ceil(waitTime / 1000)}s antes de enviar`);
      throw new Error(`Aguarde ${Math.ceil(waitTime / 1000)}s antes de enviar próxima mensagem`);
    }

    // Envia foto (para chat correto)
    await sendPhoto(actualChatId, photo_url, processedCaption, link);

    // Registra envio
    registerSend(actualChatId);

    // Atualiza métrica
    await Metric.updateStatus(id, 'sent');

    const modeLabel = isTest ? '🧪 TESTE' : '🚀 PRODUÇÃO';
    logger.info(`${modeLabel} Agendamento ${id} enviado com sucesso`);

    return {
      success: true,
      message: `Postagem enviada com sucesso (${modeLabel})`,
      scheduleId: id,
      testMode: isTest
    };
  } catch (error) {
    logger.error(`❌ Erro ao enviar agendamento ${scheduleData.id}:`, error);

    // Registra erro em métrica
    try {
      await Metric.updateStatus(scheduleData.id, 'failed', error.message);
    } catch (metricError) {
      logger.error('Erro ao registrar métrica de erro:', metricError);
    }

    throw error;
  }
};

module.exports = {
  getMe,
  sendMessage,
  sendPhoto,
  sendScheduledPost,
  getWaitTime,
  registerSend,
  validateConfig,
  MIN_INTERVAL_MS
};
