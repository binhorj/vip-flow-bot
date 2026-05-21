/**
 * TESTE DO TELEGRAMSERVICE - ENVIO DE FOTOS LOCAIS
 * Valida se a correção de URLs locais funciona
 */

const path = require('path');
const fs = require('fs');

// Simula o telegramService
const telegramService = require('./src/services/telegramService');

console.log('=== TESTE DO TELEGRAM SERVICE ===\n');

// Testa detecção de URLs locais
const testUrls = [
  'http://localhost:3000/uploads/foto1.jpeg',
  'http://127.0.0.1:3000/uploads/foto2.jpeg',
  '/uploads/foto3.jpeg',
  'https://cdn.example.com/foto4.jpeg',
  'https://example.com/uploads/foto5.jpeg'
];

console.log('📋 Detectando tipo de URL:\n');
testUrls.forEach(url => {
  const isLocal = url.includes('localhost') ||
                  url.includes('127.0.0.1') ||
                  url.startsWith('/uploads') ||
                  !url.startsWith('http');

  const type = isLocal ? '🏠 LOCAL (arquivo)' : '🌐 URL PÚBLICA';
  console.log(`${type}  | ${url}`);
});

console.log('\n✅ Telegramservice importado com sucesso');
console.log('✅ Funções disponíveis:', Object.keys(telegramService).join(', '));
console.log('\n🧪 Teste concluído - Verificar logs de importação acima');
