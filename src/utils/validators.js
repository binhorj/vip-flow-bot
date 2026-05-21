/**
 * Validações simples e diretas
 * Sem bibliotecas externas
 */

// Valida email
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Valida senha (mínimo 6 caracteres)
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Valida URL
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Valida data ISO (2026-05-21)
const isValidDate = (dateStr) => {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
};

// Valida categoria de legenda
const isValidCategory = (category) => {
  const valid = ['soft', 'curiosity', 'exclusivity', 'urgency', 'cta'];
  return valid.includes(category);
};

// Valida status de campanha
const isValidCampaignStatus = (status) => {
  const valid = ['active', 'paused', 'completed'];
  return valid.includes(status);
};

// Valida tipo de foto (marketing)
const isValidPhotoType = (type) => {
  const valid = ['previa', 'destaque', 'oferta', 'novidade'];
  return valid.includes(type);
};

// Valida nível de chamada
const isValidCallLevel = (level) => {
  const valid = ['suave', 'medio', 'direto'];
  return valid.includes(level);
};

// Valida estratégia de marketing
const isValidMarketingStrategy = (strategy) => {
  const valid = ['curiosidade', 'exclusividade', 'urgencia', 'oferta', 'novidade', 'suave', 'cta'];
  return valid.includes(strategy);
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidUrl,
  isValidDate,
  isValidCategory,
  isValidCampaignStatus,
  isValidPhotoType,
  isValidCallLevel,
  isValidMarketingStrategy
};
